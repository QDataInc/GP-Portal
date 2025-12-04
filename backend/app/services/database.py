from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus

# --------------------------------------
# Azure SQL Database Configuration
# --------------------------------------
AZURE_SQL_SERVER = "gpportalserver.database.windows.net"
AZURE_SQL_DATABASE = "gp_portal"
AZURE_SQL_USERNAME = "gpadmin"
AZURE_SQL_PASSWORD = "Gp@dmin12345!"   # TODO: move to .env later

# Build raw ODBC string
raw_odbc_string = (
    "Driver={ODBC Driver 18 for SQL Server};"
    f"Server=tcp:{AZURE_SQL_SERVER},1433;"
    f"Database={AZURE_SQL_DATABASE};"
    f"Uid={AZURE_SQL_USERNAME};"
    f"Pwd={AZURE_SQL_PASSWORD};"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
    "Connection Timeout=30;"
)

# URL-encode ODBC string for SQLAlchemy
encoded_odbc = quote_plus(raw_odbc_string)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={encoded_odbc}"

# --------------------------------------
# SQLAlchemy Setup
# --------------------------------------
engine = create_engine(
    DATABASE_URL,
    fast_executemany=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# FastAPI dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()