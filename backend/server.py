from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============== ENUMS ==============
class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"

class PaymentMethod(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"
    PIX = "pix"
    CASH = "cash"


# ============== MODELS ==============
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    icon: str


class FixedExpenseMonth(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fixed_expense_id: str
    name: str
    category_id: str
    amount: float
    due_day: int
    month: int
    year: int
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    paid_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FixedExpenseMonthCreate(BaseModel):
    fixed_expense_id: str
    name: str
    category_id: str
    amount: float
    due_day: int
    month: int
    year: int

class FixedExpenseMonthUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None

class MarkAsPaidRequest(BaseModel):
    payment_method: PaymentMethod


class FixedExpenseTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category_id: str
    amount: float
    due_day: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FixedExpenseTemplateCreate(BaseModel):
    name: str
    category_id: str
    amount: float
    due_day: int

class FixedExpenseTemplateUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None
    is_active: Optional[bool] = None


class VariableExpense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category_id: str
    amount: float
    payment_method: Optional[PaymentMethod] = None
    date: datetime
    installments: int = 1
    current_installment: int = 1
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    paid_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VariableExpenseCreate(BaseModel):
    name: str
    category_id: str
    amount: float
    payment_method: Optional[PaymentMethod] = None
    date: datetime
    installments: int = 1
    notes: Optional[str] = None

class VariableExpenseUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    date: Optional[datetime] = None
    installments: Optional[int] = None
    notes: Optional[str] = None


class Income(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    date: datetime
    is_recurring: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncomeCreate(BaseModel):
    name: str
    amount: float
    date: datetime
    is_recurring: bool = False
    notes: Optional[str] = None

class IncomeUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    notes: Optional[str] = None


class EmergencyReserve(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    date: datetime
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmergencyReserveCreate(BaseModel):
    amount: float
    date: datetime
    description: Optional[str] = None


class SavingsGoal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[datetime] = None
    icon: str = "🎯"
    is_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavingsGoalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float
    deadline: Optional[datetime] = None
    icon: str = "🎯"

class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    deadline: Optional[datetime] = None
    icon: Optional[str] = None

class GoalContribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_id: str
    amount: float
    description: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoalContributionCreate(BaseModel):
    amount: float
    description: Optional[str] = None


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    emergency_reserve: float
    balance_with_reserve: float
    pending_expenses: List[dict]
    expenses_by_category: List[dict]
    alerts: List[dict]


# ============== ROUTES ==============

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate):
    category = Category(**input.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


# Fixed Expense Templates
@api_router.get("/fixed-expense-templates", response_model=List[FixedExpenseTemplate])
async def get_fixed_expense_templates():
    templates = await db.fixed_expense_templates.find({}, {"_id": 0}).to_list(1000)
    for temp in templates:
        if isinstance(temp.get('created_at'), str):
            temp['created_at'] = datetime.fromisoformat(temp['created_at'])
    return templates

@api_router.post("/fixed-expense-templates", response_model=FixedExpenseTemplate)
async def create_fixed_expense_template(input: FixedExpenseTemplateCreate):
    template = FixedExpenseTemplate(**input.model_dump())
    doc = template.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.fixed_expense_templates.insert_one(doc)
    return template

@api_router.put("/fixed-expense-templates/{template_id}", response_model=FixedExpenseTemplate)
async def update_fixed_expense_template(template_id: str, input: FixedExpenseTemplateUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.fixed_expense_templates.update_one(
        {"id": template_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = await db.fixed_expense_templates.find_one({"id": template_id}, {"_id": 0})
    if isinstance(template.get('created_at'), str):
        template['created_at'] = datetime.fromisoformat(template['created_at'])
    return template

@api_router.delete("/fixed-expense-templates/{template_id}")
async def delete_fixed_expense_template(template_id: str):
    result = await db.fixed_expense_templates.delete_one({"id": template_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted"}


# Fixed Expenses by Month
@api_router.get("/fixed-expenses", response_model=List[FixedExpenseMonth])
async def get_fixed_expenses(month: Optional[int] = None, year: Optional[int] = None):
    query = {}
    if month is not None:
        query['month'] = month
    if year is not None:
        query['year'] = year
    
    expenses = await db.fixed_expenses_months.find(query, {"_id": 0}).to_list(1000)
    for exp in expenses:
        if isinstance(exp.get('created_at'), str):
            exp['created_at'] = datetime.fromisoformat(exp['created_at'])
        if exp.get('paid_date') and isinstance(exp['paid_date'], str):
            exp['paid_date'] = datetime.fromisoformat(exp['paid_date'])
    return expenses

@api_router.post("/fixed-expenses", response_model=FixedExpenseMonth)
async def create_fixed_expense(input: FixedExpenseMonthCreate):
    expense = FixedExpenseMonth(**input.model_dump())
    doc = expense.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('paid_date'):
        doc['paid_date'] = doc['paid_date'].isoformat()
    await db.fixed_expenses_months.insert_one(doc)
    return expense

@api_router.put("/fixed-expenses/{expense_id}", response_model=FixedExpenseMonth)
async def update_fixed_expense(expense_id: str, input: FixedExpenseMonthUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.fixed_expenses_months.update_one(
        {"id": expense_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense = await db.fixed_expenses_months.find_one({"id": expense_id}, {"_id": 0})
    if isinstance(expense.get('created_at'), str):
        expense['created_at'] = datetime.fromisoformat(expense['created_at'])
    if expense.get('paid_date') and isinstance(expense['paid_date'], str):
        expense['paid_date'] = datetime.fromisoformat(expense['paid_date'])
    return expense

@api_router.post("/fixed-expenses/{expense_id}/mark-paid")
async def mark_fixed_expense_paid(expense_id: str, input: MarkAsPaidRequest):
    result = await db.fixed_expenses_months.update_one(
        {"id": expense_id},
        {"$set": {
            "status": PaymentStatus.PAID.value,
            "payment_method": input.payment_method.value,
            "paid_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense marked as paid"}

@api_router.delete("/fixed-expenses/{expense_id}")
async def delete_fixed_expense(expense_id: str):
    result = await db.fixed_expenses_months.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}


# Variable Expenses
@api_router.get("/variable-expenses", response_model=List[VariableExpense])
async def get_variable_expenses(month: Optional[int] = None, year: Optional[int] = None):
    query = {}
    expenses = await db.variable_expenses.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by month/year if provided
    if month is not None or year is not None:
        filtered = []
        for exp in expenses:
            date = exp.get('date')
            if isinstance(date, str):
                date = datetime.fromisoformat(date)
            if month is not None and date.month != month:
                continue
            if year is not None and date.year != year:
                continue
            filtered.append(exp)
        expenses = filtered
    
    for exp in expenses:
        if isinstance(exp.get('created_at'), str):
            exp['created_at'] = datetime.fromisoformat(exp['created_at'])
        if isinstance(exp.get('date'), str):
            exp['date'] = datetime.fromisoformat(exp['date'])
        if exp.get('paid_date') and isinstance(exp['paid_date'], str):
            exp['paid_date'] = datetime.fromisoformat(exp['paid_date'])
    return expenses

@api_router.post("/variable-expenses", response_model=VariableExpense)
async def create_variable_expense(input: VariableExpenseCreate):
    expense = VariableExpense(**input.model_dump())
    doc = expense.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['date'] = doc['date'].isoformat()
    if doc.get('paid_date'):
        doc['paid_date'] = doc['paid_date'].isoformat()
    await db.variable_expenses.insert_one(doc)
    return expense

@api_router.put("/variable-expenses/{expense_id}", response_model=VariableExpense)
async def update_variable_expense(expense_id: str, input: VariableExpenseUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    if 'date' in update_data:
        update_data['date'] = update_data['date'].isoformat()
    
    result = await db.variable_expenses.update_one(
        {"id": expense_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense = await db.variable_expenses.find_one({"id": expense_id}, {"_id": 0})
    if isinstance(expense.get('created_at'), str):
        expense['created_at'] = datetime.fromisoformat(expense['created_at'])
    if isinstance(expense.get('date'), str):
        expense['date'] = datetime.fromisoformat(expense['date'])
    if expense.get('paid_date') and isinstance(expense['paid_date'], str):
        expense['paid_date'] = datetime.fromisoformat(expense['paid_date'])
    return expense

@api_router.post("/variable-expenses/{expense_id}/mark-paid")
async def mark_variable_expense_paid(expense_id: str, input: MarkAsPaidRequest):
    result = await db.variable_expenses.update_one(
        {"id": expense_id},
        {"$set": {
            "status": PaymentStatus.PAID.value,
            "payment_method": input.payment_method.value,
            "paid_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense marked as paid"}

@api_router.delete("/variable-expenses/{expense_id}")
async def delete_variable_expense(expense_id: str):
    result = await db.variable_expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}


# Incomes
@api_router.get("/incomes", response_model=List[Income])
async def get_incomes(month: Optional[int] = None, year: Optional[int] = None):
    query = {}
    incomes = await db.incomes.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by month/year if provided
    if month is not None or year is not None:
        filtered = []
        for inc in incomes:
            date = inc.get('date')
            if isinstance(date, str):
                date = datetime.fromisoformat(date)
            if month is not None and date.month != month:
                continue
            if year is not None and date.year != year:
                continue
            filtered.append(inc)
        incomes = filtered
    
    for inc in incomes:
        if isinstance(inc.get('created_at'), str):
            inc['created_at'] = datetime.fromisoformat(inc['created_at'])
        if isinstance(inc.get('date'), str):
            inc['date'] = datetime.fromisoformat(inc['date'])
    return incomes

@api_router.post("/incomes", response_model=Income)
async def create_income(input: IncomeCreate):
    income = Income(**input.model_dump())
    doc = income.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['date'] = doc['date'].isoformat()
    await db.incomes.insert_one(doc)
    return income

@api_router.put("/incomes/{income_id}", response_model=Income)
async def update_income(income_id: str, input: IncomeUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    if 'date' in update_data:
        update_data['date'] = update_data['date'].isoformat()
    
    result = await db.incomes.update_one(
        {"id": income_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    
    income = await db.incomes.find_one({"id": income_id}, {"_id": 0})
    if isinstance(income.get('created_at'), str):
        income['created_at'] = datetime.fromisoformat(income['created_at'])
    if isinstance(income.get('date'), str):
        income['date'] = datetime.fromisoformat(income['date'])
    return income

@api_router.delete("/incomes/{income_id}")
async def delete_income(income_id: str):
    result = await db.incomes.delete_one({"id": income_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"message": "Income deleted"}


# Emergency Reserve
@api_router.get("/emergency-reserve", response_model=List[EmergencyReserve])
async def get_emergency_reserve():
    reserves = await db.emergency_reserve.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    for res in reserves:
        if isinstance(res.get('created_at'), str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
        if isinstance(res.get('date'), str):
            res['date'] = datetime.fromisoformat(res['date'])
    return reserves

@api_router.get("/emergency-reserve/balance")
async def get_emergency_reserve_balance():
    reserves = await db.emergency_reserve.find({}, {"_id": 0}).to_list(10000)
    balance = sum(res.get('amount', 0) for res in reserves)
    return {"balance": balance}

@api_router.post("/emergency-reserve", response_model=EmergencyReserve)
async def create_emergency_reserve(input: EmergencyReserveCreate):
    reserve = EmergencyReserve(**input.model_dump())
    doc = reserve.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['date'] = doc['date'].isoformat()
    await db.emergency_reserve.insert_one(doc)
    return reserve

@api_router.delete("/emergency-reserve/{reserve_id}")
async def delete_emergency_reserve(reserve_id: str):
    result = await db.emergency_reserve.delete_one({"id": reserve_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reserve entry not found")
    return {"message": "Reserve entry deleted"}


# Savings Goals
@api_router.get("/savings-goals", response_model=List[SavingsGoal])
async def get_savings_goals():
    goals = await db.savings_goals.find({}, {"_id": 0}).to_list(1000)
    for goal in goals:
        if isinstance(goal.get('created_at'), str):
            goal['created_at'] = datetime.fromisoformat(goal['created_at'])
        if goal.get('deadline') and isinstance(goal['deadline'], str):
            goal['deadline'] = datetime.fromisoformat(goal['deadline'])
    return goals

@api_router.post("/savings-goals", response_model=SavingsGoal)
async def create_savings_goal(input: SavingsGoalCreate):
    goal = SavingsGoal(**input.model_dump())
    doc = goal.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('deadline'):
        doc['deadline'] = doc['deadline'].isoformat()
    await db.savings_goals.insert_one(doc)
    return goal

@api_router.put("/savings-goals/{goal_id}", response_model=SavingsGoal)
async def update_savings_goal(goal_id: str, input: SavingsGoalUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    if 'deadline' in update_data and update_data['deadline']:
        update_data['deadline'] = update_data['deadline'].isoformat()
    
    result = await db.savings_goals.update_one(
        {"id": goal_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = await db.savings_goals.find_one({"id": goal_id}, {"_id": 0})
    if isinstance(goal.get('created_at'), str):
        goal['created_at'] = datetime.fromisoformat(goal['created_at'])
    if goal.get('deadline') and isinstance(goal['deadline'], str):
        goal['deadline'] = datetime.fromisoformat(goal['deadline'])
    return goal

@api_router.delete("/savings-goals/{goal_id}")
async def delete_savings_goal(goal_id: str):
    # Delete goal and all contributions
    await db.goal_contributions.delete_many({"goal_id": goal_id})
    result = await db.savings_goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"}


# Goal Contributions
@api_router.get("/savings-goals/{goal_id}/contributions", response_model=List[GoalContribution])
async def get_goal_contributions(goal_id: str):
    contributions = await db.goal_contributions.find({"goal_id": goal_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for contrib in contributions:
        if isinstance(contrib.get('created_at'), str):
            contrib['created_at'] = datetime.fromisoformat(contrib['created_at'])
        if isinstance(contrib.get('date'), str):
            contrib['date'] = datetime.fromisoformat(contrib['date'])
    return contributions

@api_router.post("/savings-goals/{goal_id}/contributions", response_model=GoalContribution)
async def create_goal_contribution(goal_id: str, input: GoalContributionCreate):
    contribution = GoalContribution(goal_id=goal_id, **input.model_dump())
    doc = contribution.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['date'] = doc['date'].isoformat()
    await db.goal_contributions.insert_one(doc)
    
    # Update goal current_amount
    await db.savings_goals.update_one(
        {"id": goal_id},
        {"$inc": {"current_amount": input.amount}}
    )
    
    # Check if goal is completed
    goal = await db.savings_goals.find_one({"id": goal_id}, {"_id": 0})
    if goal and goal.get('current_amount', 0) >= goal.get('target_amount', 0):
        await db.savings_goals.update_one(
            {"id": goal_id},
            {"$set": {"is_completed": True}}
        )
    
    return contribution

@api_router.delete("/savings-goals/{goal_id}/contributions/{contribution_id}")
async def delete_goal_contribution(goal_id: str, contribution_id: str):
    contribution = await db.goal_contributions.find_one({"id": contribution_id, "goal_id": goal_id}, {"_id": 0})
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution not found")
    
    # Update goal current_amount
    await db.savings_goals.update_one(
        {"id": goal_id},
        {"$inc": {"current_amount": -contribution['amount']}}
    )
    
    # Delete contribution
    await db.goal_contributions.delete_one({"id": contribution_id})
    
    return {"message": "Contribution deleted"}


# Dashboard
@api_router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard(month: int, year: int):
    # Get incomes
    all_incomes = await db.incomes.find({}, {"_id": 0}).to_list(1000)
    incomes = []
    for inc in all_incomes:
        date = inc.get('date')
        if isinstance(date, str):
            date = datetime.fromisoformat(date)
        if date.month == month and date.year == year:
            incomes.append(inc)
    
    total_income = sum(inc.get('amount', 0) for inc in incomes)
    
    # Get fixed expenses for the month
    fixed_expenses = await db.fixed_expenses_months.find(
        {"month": month, "year": year},
        {"_id": 0}
    ).to_list(1000)
    
    # Get variable expenses
    all_variable = await db.variable_expenses.find({}, {"_id": 0}).to_list(1000)
    variable_expenses = []
    for exp in all_variable:
        date = exp.get('date')
        if isinstance(date, str):
            date = datetime.fromisoformat(date)
        if date.month == month and date.year == year:
            variable_expenses.append(exp)
    
    # Calculate total expenses (only PAID ones affect the balance)
    total_fixed_paid = sum(
        exp.get('amount', 0) 
        for exp in fixed_expenses 
        if exp.get('status') == PaymentStatus.PAID.value
    )
    total_variable_paid = sum(
        exp.get('amount', 0) 
        for exp in variable_expenses 
        if exp.get('status') == PaymentStatus.PAID.value
    )
    total_expenses = total_fixed_paid + total_variable_paid
    
    balance = total_income - total_expenses
    
    # Get emergency reserve balance
    reserves = await db.emergency_reserve.find({}, {"_id": 0}).to_list(10000)
    emergency_reserve = sum(res.get('amount', 0) for res in reserves)
    
    balance_with_reserve = balance + emergency_reserve
    
    # Get pending expenses
    pending_fixed = [
        {
            "id": exp['id'],
            "name": exp['name'],
            "amount": exp['amount'],
            "due_day": exp['due_day'],
            "type": "fixed",
            "category_id": exp['category_id']
        }
        for exp in fixed_expenses
        if exp.get('status') == PaymentStatus.PENDING.value
    ]
    
    pending_variable = [
        {
            "id": exp['id'],
            "name": exp['name'],
            "amount": exp['amount'],
            "date": exp['date'],
            "type": "variable",
            "category_id": exp['category_id']
        }
        for exp in variable_expenses
        if exp.get('status') == PaymentStatus.PENDING.value
    ]
    
    pending_expenses = pending_fixed + pending_variable
    
    # Get categories for grouping
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    category_map = {cat['id']: cat for cat in categories}
    
    # Calculate expenses by category
    expenses_by_cat = {}
    for exp in fixed_expenses:
        if exp.get('status') == PaymentStatus.PAID.value:
            cat_id = exp.get('category_id')
            expenses_by_cat[cat_id] = expenses_by_cat.get(cat_id, 0) + exp.get('amount', 0)
    
    for exp in variable_expenses:
        if exp.get('status') == PaymentStatus.PAID.value:
            cat_id = exp.get('category_id')
            expenses_by_cat[cat_id] = expenses_by_cat.get(cat_id, 0) + exp.get('amount', 0)
    
    expenses_by_category = [
        {
            "category_id": cat_id,
            "category_name": category_map.get(cat_id, {}).get('name', 'Unknown'),
            "category_icon": category_map.get(cat_id, {}).get('icon', '💰'),
            "amount": amount,
            "percentage": (amount / total_expenses * 100) if total_expenses > 0 else 0
        }
        for cat_id, amount in expenses_by_cat.items()
    ]
    expenses_by_category.sort(key=lambda x: x['amount'], reverse=True)
    
    # Generate alerts for due dates
    alerts = []
    today = datetime.now(timezone.utc)
    for exp in pending_fixed:
        due_date = datetime(year, month, exp['due_day'], tzinfo=timezone.utc)
        days_until = (due_date - today).days
        if 0 <= days_until <= 3:
            alerts.append({
                "type": "warning",
                "message": f"{exp['name']} vence em {days_until} dia(s)",
                "expense_id": exp['id']
            })
    
    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance,
        emergency_reserve=emergency_reserve,
        balance_with_reserve=balance_with_reserve,
        pending_expenses=pending_expenses,
        expenses_by_category=expenses_by_category,
        alerts=alerts
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
