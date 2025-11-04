from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/api/investments",
    tags=["Investments"]
)

# ---- Data model ----
class Investment(BaseModel):
    id: int
    deal_name: str
    investment_total: float
    distribution_total: float
    status: str


# ---- Fake DB (temporary) ----
investments_db: List[Investment] = [
    Investment(id=1, deal_name="Irving Oaks", investment_total=300000, distribution_total=27048.30, status="Active"),
    Investment(id=2, deal_name="Victory Fund", investment_total=500000, distribution_total=120000.00, status="Closed")
]


# ---- GET all investments ----
@router.get("/", response_model=List[Investment])
def get_investments():
    return investments_db


# ---- POST create new investment ----
@router.post("/", response_model=Investment)
def add_investment(investment: Investment):
    # check duplicate id
    for inv in investments_db:
        if inv.id == investment.id:
            raise HTTPException(status_code=400, detail="Investment ID already exists")
    investments_db.append(investment)
    return investment
