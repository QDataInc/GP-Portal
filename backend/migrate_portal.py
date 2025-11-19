import os
import sqlite3
from datetime import datetime
import pyodbc
from azure.storage.blob import BlobServiceClient

# ==========================
# CONFIG
# ==========================

SQLITE_DB_PATH = r"C:\CODE\GP-Portal\Gp-portal\backend\gp_portal.db"
LOCAL_DOCS_ROOT = r"C:\CODE\GP-Portal\Gp-portal\backend\uploads"  # <-- FIX: point directly to uploads folder

AZURE_SQL_SERVER = "gpportalserver.database.windows.net"
AZURE_SQL_DATABASE = "gp_portal"
AZURE_SQL_USERNAME = "gpadmin"
AZURE_SQL_PASSWORD = "Gp@dmin12345!"

AZURE_BLOB_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=gpportal;AccountKey=fOm3SsRNf0NdU3WJmWtxyX6q2Q5+52vCg3AnAqkH92iJm+8lfksryJgQC54naB3sK1KYbdusKAQH+ASt1Y5zvQ==;EndpointSuffix=core.windows.net"
AZURE_BLOB_CONTAINER = "documents"


# ==========================
# HELPER FUNCTIONS
# ==========================

def get_sqlserver_type(sqlite_type: str) -> str:
    if not sqlite_type:
        return "NVARCHAR(MAX)"
    t = sqlite_type.upper()
    if "INT" in t:
        return "INT"
    if any(x in t for x in ["CHAR", "CLOB", "TEXT"]):
        return "NVARCHAR(MAX)"
    if any(x in t for x in ["REAL", "FLOA", "DOUB"]):
        return "FLOAT"
    if "BLOB" in t:
        return "VARBINARY(MAX)"
    if "DATE" in t or "TIME" in t:
        return "DATETIME"
    return "NVARCHAR(MAX)"


def normalize_datetime(value):
    if not isinstance(value, str):
        return value
    if " " in value and "." in value:
        try:
            base, frac = value.split(".")
            return f"{base}.{frac[:3]}"
        except:
            return value
    return value


def build_sqlserver_schema(sqlite_conn):
    cursor = sqlite_conn.cursor()
    cursor.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    )
    tables = cursor.fetchall()

    results = {}

    for name, create_sql in tables:
        pragma = cursor.execute(f"PRAGMA table_info({name});").fetchall()

        col_defs = []
        col_names = []
        pk_cols = []
        identity_col = None
        has_autoinc = "AUTOINCREMENT" in (create_sql or "").upper()

        for cid, col_name, col_type, notnull, dflt, pk in pragma:
            col_names.append(col_name)
            sql_type = get_sqlserver_type(col_type)
            col_def = f"[{col_name}] {sql_type}"

            if pk == 1 and has_autoinc and "INT" in sql_type.upper():
                col_def += " IDENTITY(1,1) PRIMARY KEY"
                identity_col = col_name
            else:
                if notnull:
                    col_def += " NOT NULL"
                if dflt is not None:
                    col_def += f" DEFAULT {dflt}"
                if pk == 1 and identity_col is None:
                    pk_cols.append(col_name)

            col_defs.append(col_def)

        pk_constraint = ""
        if pk_cols and identity_col is None:
            pk_constraint = ", PRIMARY KEY (" + ", ".join(f"[{c}]" for c in pk_cols) + ")"

        create_tsql = (
            f"IF OBJECT_ID('dbo.[{name}]', 'U') IS NOT NULL DROP TABLE dbo.[{name}];\n"
            f"CREATE TABLE dbo.[{name}] (\n    " +
            ",\n    ".join(col_defs) +
            pk_constraint +
            "\n);\n"
        )

        results[name] = {
            "create": create_tsql,
            "columns": col_names,
            "identity_col": identity_col,
        }

    return results


def connect_azure_sql():
    conn_str = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={AZURE_SQL_SERVER};"
        f"DATABASE={AZURE_SQL_DATABASE};"
        f"UID={AZURE_SQL_USERNAME};"
        f"PWD={AZURE_SQL_PASSWORD};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )
    conn = pyodbc.connect(conn_str)
    conn.autocommit = False
    return conn


# ==========================
# MIGRATE TABLES (NO GO)
# ==========================

def migrate_table(sqlite_conn, sql_conn, table_name, schema_info):
    print(f"\n=== Migrating table: {table_name} ===")
    cursor_sql = sql_conn.cursor()

    create_sql_clean = "\n".join(
        line for line in schema_info["create"].splitlines()
        if "GO" not in line.upper()
    )

    cursor_sql.execute(create_sql_clean)

    sqlite_cur = sqlite_conn.cursor()
    rows = sqlite_cur.execute(f"SELECT * FROM {table_name};").fetchall()
    col_names = schema_info["columns"]

    if not rows:
        print("No rows to migrate.")
        sql_conn.commit()
        return

    placeholders = ", ".join("?" for _ in col_names)
    cols_joined = ", ".join(f"[{c}]" for c in col_names)
    insert_sql = f"INSERT INTO dbo.[{table_name}] ({cols_joined}) VALUES ({placeholders})"

    identity_col = schema_info.get("identity_col")
    if identity_col:
        cursor_sql.execute(f"SET IDENTITY_INSERT dbo.[{table_name}] ON;")

    processed_rows = []
    for row in rows:
        row = [normalize_datetime(val) for val in row]
        processed_rows.append(tuple(row))

    cursor_sql.fast_executemany = True
    cursor_sql.executemany(insert_sql, processed_rows)

    if identity_col:
        cursor_sql.execute(f"SET IDENTITY_INSERT dbo.[{table_name}] OFF;")

    sql_conn.commit()
    print("Done.")


# ==========================
# FIXED PDF UPLOAD (NO DUPLICATE UPLOADS/)
# ==========================

def upload_pdfs_and_update_documents(sqlite_conn, sql_conn):
    print("\n=== Uploading PDFs to Blob Storage ===")

    sqlite_cur = sqlite_conn.cursor()
    rows = sqlite_cur.execute("SELECT id, file_path FROM documents;").fetchall()

    if not rows:
        print("No documents found; skipping upload.")
        return

    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container_client = blob_service.get_container_client(AZURE_BLOB_CONTAINER)

    try:
        container_client.create_container()
    except:
        pass

    sql_cur = sql_conn.cursor()

    for doc_id, file_path in rows:
        if not file_path:
            continue

        # Normalize slashes
        clean_path = file_path.replace("\\", "/")

        # Remove leading uploads/
        clean_path = clean_path.replace("uploads/", "")

        local_path = os.path.join(LOCAL_DOCS_ROOT, clean_path)

        print(f"Looking for file: {local_path}")

        if not os.path.isfile(local_path):
            print(f"Missing file: {local_path}")
            continue

        blob_name = os.path.basename(clean_path)

        print(f"Uploading {blob_name}...")
        with open(local_path, "rb") as f:
            container_client.upload_blob(blob_name, f, overwrite=True)

        blob_url = f"{container_client.url}/{blob_name}"

        sql_cur.execute(
            "UPDATE dbo.[documents] SET file_path = ? WHERE id = ?;",
            (blob_url, doc_id),
        )

    sql_conn.commit()
    print("\nPDF upload completed.\n")


# ==========================
# MAIN
# ==========================

def main():
    if not os.path.isfile(SQLITE_DB_PATH):
        raise FileNotFoundError(f"SQLite DB not found: {SQLITE_DB_PATH}")

    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)

    print("Building schema from SQLite...")
    schema_map = build_sqlserver_schema(sqlite_conn)

    print("Connecting to Azure SQL...")
    sql_conn = connect_azure_sql()

    for table_name, info in schema_map.items():
        migrate_table(sqlite_conn, sql_conn, table_name, info)

    print("\nUploading documents...")
    upload_pdfs_and_update_documents(sqlite_conn, sql_conn)

    sqlite_conn.close()
    sql_conn.close()

    print("\n=== Migration completed successfully ===")


if __name__ == "__main__":
    main()
