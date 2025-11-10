from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Enum as SQLEnum, select, delete, update as sql_update, Text
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
# import uuid  uuid # Removido pois os IDs agora são auto-incremento
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MySQL connection
DATABASE_URL = os.environ.get('DATABASE_URL', 'mysql+aiomysql://root:@localhost/cash_management')
engine = create_async_engine(DATABASE_URL, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Database models base
class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_maker() as session:
        yield session

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


# ============== DATABASE MODELS ==============
class CategoryDB(Base):
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime)

class FixedExpenseTemplateDB(Base):
    __tablename__ = "fixed_expense_templates"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    category_id: Mapped[int] = mapped_column(Integer)
    base_amount: Mapped[float] = mapped_column(Float)
    due_day: Mapped[int] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class FixedExpenseMonthDB(Base):
    __tablename__ = "fixed_expenses_months"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fixed_expense_id: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String(255))
    category_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    due_day: Mapped[int] = mapped_column(Integer)
    month: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    payment_method: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    paid_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class VariableExpenseDB(Base):
    __tablename__ = "variable_expenses"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    category_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    payment_method: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime)
    installments: Mapped[int] = mapped_column(Integer, default=1)
    current_installment: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    paid_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class IncomeDB(Base):
    __tablename__ = "incomes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float] = mapped_column(Float)
    date: Mapped[datetime] = mapped_column(DateTime)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class EmergencyReserveDB(Base):
    __tablename__ = "emergency_reserve"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    amount: Mapped[float] = mapped_column(Float)
    date: Mapped[datetime] = mapped_column(DateTime)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class SavingsGoalDB(Base):
    __tablename__ = "savings_goals"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_amount: Mapped[float] = mapped_column(Float)
    current_amount: Mapped[float] = mapped_column(Float, default=0.0)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), default="🎯")
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime)

class GoalContributionDB(Base):
    __tablename__ = "goal_contributions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    goal_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime)


# ============== PYDANTIC MODELS ==============
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    name: str
    icon: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    icon: str


class FixedExpenseMonth(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    fixed_expense_id: int
    name: str
    category_id: int
    amount: float
    due_day: int
    month: int
    year: int
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    paid_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FixedExpenseMonthCreate(BaseModel):
    fixed_expense_id: int
    name: str
    category_id: int
    amount: float
    due_day: int
    month: int
    year: int

class FixedExpenseMonthUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None

class MarkAsPaidRequest(BaseModel):
    payment_method: PaymentMethod


class FixedExpenseTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True, populate_by_name=True)
    id: int
    name: str
    category_id: int
    amount: float = Field(alias="base_amount")
    due_day: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FixedExpenseTemplateCreate(BaseModel):
    name: str
    category_id: int
    amount: float
    due_day: int

class FixedExpenseTemplateUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None
    is_active: Optional[bool] = None


class VariableExpense(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    name: str
    category_id: int
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
    category_id: int
    amount: float
    payment_method: Optional[PaymentMethod] = None
    date: datetime
    installments: int = 1
    notes: Optional[str] = None

class VariableExpenseUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    date: Optional[datetime] = None
    installments: Optional[int] = None
    notes: Optional[str] = None


class Income(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
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
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    amount: float
    date: datetime
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmergencyReserveCreate(BaseModel):
    amount: float
    date: datetime
    description: Optional[str] = None


class SavingsGoal(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
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
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    goal_id: int
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
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CategoryDB))
    categories = result.scalars().all()
    return [Category.model_validate(cat) for cat in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = CategoryDB(
        name=input.name,
        icon=input.icon,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return Category.model_validate(db_category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CategoryDB).where(CategoryDB.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted"}


# Fixed Expense Templates
@api_router.get("/fixed-expense-templates", response_model=List[FixedExpenseTemplate])
async def get_fixed_expense_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseTemplateDB))
    templates = result.scalars().all()
    return [FixedExpenseTemplate.model_validate(t) for t in templates]

@api_router.post("/fixed-expense-templates", response_model=FixedExpenseTemplate)
async def create_fixed_expense_template(input: FixedExpenseTemplateCreate, db: AsyncSession = Depends(get_db)):
    db_template = FixedExpenseTemplateDB(
        name=input.name,
        category_id=input.category_id,
        base_amount=input.amount,
        due_day=input.due_day,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return FixedExpenseTemplate.model_validate(db_template)

@api_router.put("/fixed-expense-templates/{template_id}", response_model=FixedExpenseTemplate)
async def update_fixed_expense_template(template_id: int, input: FixedExpenseTemplateUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseTemplateDB).where(FixedExpenseTemplateDB.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # Mapeia 'amount' para 'base_amount' no banco
        if key == 'amount':
            setattr(template, 'base_amount', value)
        else:
            setattr(template, key, value)
    
    await db.commit()
    await db.refresh(template)
    return FixedExpenseTemplate.model_validate(template)

@api_router.delete("/fixed-expense-templates/{template_id}")
async def delete_fixed_expense_template(template_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseTemplateDB).where(FixedExpenseTemplateDB.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted"}

@api_router.post("/fixed-expense-templates/{template_id}/generate-month", response_model=FixedExpenseMonth)
async def generate_month_from_template(
    template_id: int, 
    month: int, 
    year: int, 
    db: AsyncSession = Depends(get_db)
):
    """Gera uma instância mensal a partir de um template específico"""
    # Busca o template
    result = await db.execute(select(FixedExpenseTemplateDB).where(FixedExpenseTemplateDB.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_active:
        raise HTTPException(status_code=400, detail="Template is not active")
    
    # Verifica se já existe uma instância para este mês/ano
    result = await db.execute(
        select(FixedExpenseMonthDB).where(
            FixedExpenseMonthDB.fixed_expense_id == template_id,
            FixedExpenseMonthDB.month == month,
            FixedExpenseMonthDB.year == year
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Expense already exists for this month")
    
    # Cria a instância mensal
    db_expense = FixedExpenseMonthDB(
        fixed_expense_id=template.id,
        name=template.name,
        category_id=template.category_id,
        amount=template.base_amount,
        due_day=template.due_day,
        month=month,
        year=year,
        status=PaymentStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_expense)
    await db.commit()
    await db.refresh(db_expense)
    return FixedExpenseMonth.model_validate(db_expense)

@api_router.post("/fixed-expense-templates/generate-all-for-month")
async def generate_all_templates_for_month(
    month: int, 
    year: int, 
    db: AsyncSession = Depends(get_db)
):
    """Gera instâncias mensais para todos os templates ativos"""
    # Busca todos os templates ativos
    result = await db.execute(
        select(FixedExpenseTemplateDB).where(FixedExpenseTemplateDB.is_active == True)
    )
    templates = result.scalars().all()
    
    if not templates:
        return {"message": "No active templates found", "created": 0, "skipped": 0}
    
    created_count = 0
    skipped_count = 0
    created_expenses = []
    
    for template in templates:
        # Verifica se já existe
        result = await db.execute(
            select(FixedExpenseMonthDB).where(
                FixedExpenseMonthDB.fixed_expense_id == template.id,
                FixedExpenseMonthDB.month == month,
                FixedExpenseMonthDB.year == year
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            skipped_count += 1
            continue
        
        # Cria a instância mensal
        db_expense = FixedExpenseMonthDB(
            fixed_expense_id=template.id,
            name=template.name,
            category_id=template.category_id,
            amount=template.base_amount,
            due_day=template.due_day,
            month=month,
            year=year,
            status=PaymentStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_expense)
        created_count += 1
        created_expenses.append({
            "name": template.name,
            "amount": template.base_amount
        })
    
    await db.commit()
    
    return {
        "message": f"Generated {created_count} expenses, skipped {skipped_count} existing",
        "created": created_count,
        "skipped": skipped_count,
        "expenses": created_expenses
    }


# Fixed Expenses by Month
@api_router.get("/fixed_expenses_months", response_model=List[FixedExpenseMonth])
async def get_fixed_expenses(month: Optional[int] = None, year: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(FixedExpenseMonthDB)
    if month is not None:
        query = query.where(FixedExpenseMonthDB.month == month)
    if year is not None:
        query = query.where(FixedExpenseMonthDB.year == year)
    
    result = await db.execute(query)
    expenses = result.scalars().all()
    return [FixedExpenseMonth.model_validate(e) for e in expenses]

@api_router.post("/fixed_expenses_months", response_model=FixedExpenseMonth)
async def create_fixed_expense_month(input: FixedExpenseMonthCreate, db: AsyncSession = Depends(get_db)):
    db_expense = FixedExpenseMonthDB(
        fixed_expense_id=input.fixed_expense_id,
        name=input.name,
        category_id=input.category_id,
        amount=input.amount,
        due_day=input.due_day,
        month=input.month,
        year=input.year,
        status=PaymentStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_expense)
    await db.commit()
    await db.refresh(db_expense)
    return FixedExpenseMonth.model_validate(db_expense)

@api_router.put("/fixed_expenses_months/{expense_id}", response_model=FixedExpenseMonth)
async def update_fixed_expense_month(expense_id: int, input: FixedExpenseMonthUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseMonthDB).where(FixedExpenseMonthDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    
    await db.commit()
    await db.refresh(expense)
    return FixedExpenseMonth.model_validate(expense)

@api_router.post("/fixed_expenses_months/{expense_id}/mark-as-paid", response_model=FixedExpenseMonth)
async def mark_fixed_expense_as_paid(expense_id: int, input: MarkAsPaidRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseMonthDB).where(FixedExpenseMonthDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = PaymentStatus.PAID.value
    expense.payment_method = input.payment_method.value
    expense.paid_date = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(expense)
    return FixedExpenseMonth.model_validate(expense)

@api_router.delete("/fixed_expenses_months/{expense_id}")
async def delete_fixed_expense_month(expense_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FixedExpenseMonthDB).where(FixedExpenseMonthDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.delete(expense)
    await db.commit()
    return {"message": "Expense deleted"}


# Variable Expenses
@api_router.get("/variable_expenses", response_model=List[VariableExpense])
async def get_variable_expenses(month: Optional[int] = None, year: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(VariableExpenseDB)
    
    result = await db.execute(query)
    all_expenses = result.scalars().all()
    
    # Filter by month/year if provided
    if month is not None or year is not None:
        filtered = []
        for exp in all_expenses:
            if month is not None and exp.date.month != month:
                continue
            if year is not None and exp.date.year != year:
                continue
            filtered.append(exp)
        all_expenses = filtered
    
    return [VariableExpense.model_validate(e) for e in all_expenses]

@api_router.post("/variable_expenses", response_model=List[VariableExpense])
async def create_variable_expense(input: VariableExpenseCreate, db: AsyncSession = Depends(get_db)):
    created_expenses = []
    
    for i in range(input.installments):
        # Adjust date for installments
        expense_date = input.date
        if i > 0:
            month = input.date.month + i
            year = input.date.year
            while month > 12:
                month -= 12
                year += 1
            expense_date = input.date.replace(month=month, year=year)
        
        db_expense = VariableExpenseDB(
            name=f"{input.name} {i+1}/{input.installments}" if input.installments > 1 else input.name,
            category_id=input.category_id,
            amount=input.amount,
            payment_method=input.payment_method.value if input.payment_method else None,
            date=expense_date,
            installments=input.installments,
            current_installment=i + 1,
            status=PaymentStatus.PENDING.value,
            notes=input.notes,
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_expense)
        created_expenses.append(db_expense)
    
    await db.commit()
    for exp in created_expenses:
        await db.refresh(exp)
    
    return [VariableExpense.model_validate(exp) for exp in created_expenses]

@api_router.put("/variable_expenses/{expense_id}", response_model=VariableExpense)
async def update_variable_expense(expense_id: int, input: VariableExpenseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VariableExpenseDB).where(VariableExpenseDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "payment_method" and value:
            setattr(expense, key, value.value)
        else:
            setattr(expense, key, value)
    
    await db.commit()
    await db.refresh(expense)
    return VariableExpense.model_validate(expense)

@api_router.post("/variable_expenses/{expense_id}/mark-as-paid", response_model=VariableExpense)
async def mark_variable_expense_as_paid(expense_id: int, input: MarkAsPaidRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VariableExpenseDB).where(VariableExpenseDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = PaymentStatus.PAID.value
    expense.payment_method = input.payment_method.value
    expense.paid_date = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(expense)
    return VariableExpense.model_validate(expense)

@api_router.delete("/variable_expenses/{expense_id}")
async def delete_variable_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VariableExpenseDB).where(VariableExpenseDB.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.delete(expense)
    await db.commit()
    return {"message": "Expense deleted"}


# Incomes
@api_router.get("/incomes", response_model=List[Income])
async def get_incomes(month: Optional[int] = None, year: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(IncomeDB)
    
    result = await db.execute(query)
    all_incomes = result.scalars().all()
    
    # Filter by month/year if provided
    if month is not None or year is not None:
        filtered = []
        for inc in all_incomes:
            if month is not None and inc.date.month != month:
                continue
            if year is not None and inc.date.year != year:
                continue
            filtered.append(inc)
        all_incomes = filtered
    
    return [Income.model_validate(i) for i in all_incomes]

@api_router.post("/incomes", response_model=Income)
async def create_income(input: IncomeCreate, db: AsyncSession = Depends(get_db)):
    db_income = IncomeDB(
        name=input.name,
        amount=input.amount,
        date=input.date,
        is_recurring=input.is_recurring,
        notes=input.notes,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_income)
    await db.commit()
    await db.refresh(db_income)
    return Income.model_validate(db_income)

@api_router.put("/incomes/{income_id}", response_model=Income)
async def update_income(income_id: int, input: IncomeUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IncomeDB).where(IncomeDB.id == income_id))
    income = result.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(income, key, value)
    
    await db.commit()
    await db.refresh(income)
    return Income.model_validate(income)

@api_router.delete("/incomes/{income_id}")
async def delete_income(income_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IncomeDB).where(IncomeDB.id == income_id))
    income = result.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    await db.delete(income)
    await db.commit()
    return {"message": "Income deleted"}



# Emergency Reserve
@api_router.get("/emergency_reserve", response_model=List[EmergencyReserve])
async def get_emergency_reserve(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmergencyReserveDB).order_by(EmergencyReserveDB.date.desc()))
    reserves = result.scalars().all()
    return [EmergencyReserve.model_validate(r) for r in reserves]

@api_router.get("/emergency_reserve/total")
async def get_emergency_reserve_total(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmergencyReserveDB))
    reserves = result.scalars().all()
    total = sum(r.amount for r in reserves)
    return {"total": total}

@api_router.post("/emergency_reserve", response_model=EmergencyReserve)
async def create_emergency_reserve(input: EmergencyReserveCreate, db: AsyncSession = Depends(get_db)):
    db_reserve = EmergencyReserveDB(
        amount=input.amount,
        date=input.date,
        description=input.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_reserve)
    await db.commit()
    await db.refresh(db_reserve)
    return EmergencyReserve.model_validate(db_reserve)

@api_router.delete("/emergency_reserve/{reserve_id}")
async def delete_emergency_reserve(reserve_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmergencyReserveDB).where(EmergencyReserveDB.id == reserve_id))
    reserve = result.scalar_one_or_none()
    if not reserve:
        raise HTTPException(status_code=404, detail="Reserve not found")
    await db.delete(reserve)
    await db.commit()
    return {"message": "Reserve deleted"}


# Savings Goals
@api_router.get("/savings_goals", response_model=List[SavingsGoal])
async def get_savings_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SavingsGoalDB))
    goals = result.scalars().all()
    return [SavingsGoal.model_validate(g) for g in goals]

@api_router.post("/savings_goals", response_model=SavingsGoal)
async def create_savings_goal(input: SavingsGoalCreate, db: AsyncSession = Depends(get_db)):
    db_goal = SavingsGoalDB(
        name=input.name,
        description=input.description,
        target_amount=input.target_amount,
        current_amount=input.current_amount,
        deadline=input.deadline,
        icon=input.icon,
        is_completed=input.is_completed,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_goal)
    await db.commit()
    await db.refresh(db_goal)
    return SavingsGoal.model_validate(db_goal)

@api_router.put("/savings_goals/{goal_id}", response_model=SavingsGoal)
async def update_savings_goal(goal_id: int, input: SavingsGoalUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SavingsGoalDB).where(SavingsGoalDB.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    
    await db.commit()
    await db.refresh(goal)
    return SavingsGoal.model_validate(goal)

@api_router.delete("/savings_goals/{goal_id}")
async def delete_savings_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    # Delete all contributions first
    await db.execute(delete(GoalContributionDB).where(GoalContributionDB.goal_id == goal_id))
    
    # Delete the goal
    result = await db.execute(select(SavingsGoalDB).where(SavingsGoalDB.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
    return {"message": "Goal deleted"}


# Goal Contributions
@api_router.get("/savings_goals/{goal_id}/contributions", response_model=List[GoalContribution])
async def get_goal_contributions(goal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GoalContributionDB)
        .where(GoalContributionDB.goal_id == goal_id)
        .order_by(GoalContributionDB.date.desc())
    )
    contributions = result.scalars().all()
    return [GoalContribution.model_validate(c) for c in contributions]

@api_router.post("/savings_goals/{goal_id}/contributions", response_model=GoalContribution)
async def create_goal_contribution(goal_id: int, input: GoalContributionCreate, db: AsyncSession = Depends(get_db)):
    db_contribution = GoalContributionDB(
        goal_id=goal_id,
        amount=input.amount,
        description=input.description,
        date=input.date,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_contribution)
    await db.commit()
    await db.refresh(db_contribution)
    
    # Update goal current amount
    result = await db.execute(select(SavingsGoalDB).where(SavingsGoalDB.id == goal_id))
    goal = result.scalar_one_or_none()
    if goal:
        goal.current_amount += input.amount
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
    await db.commit()
    
    return GoalContribution.model_validate(db_contribution)

@api_router.delete("/savings_goals/{goal_id}/contributions/{contribution_id}")
async def delete_goal_contribution(goal_id: int, contribution_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GoalContributionDB)
        .where(GoalContributionDB.id == contribution_id, GoalContributionDB.goal_id == goal_id)
    )
    contribution = result.scalar_one_or_none()
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution not found")
    
    # Update goal current_amount
    result = await db.execute(select(SavingsGoalDB).where(SavingsGoalDB.id == goal_id))
    goal = result.scalar_one_or_none()
    if goal:
        goal.current_amount -= contribution.amount
        goal.is_completed = False # Recalculate completion status
    
    await db.delete(contribution)
    await db.commit()
    return {"message": "Contribution deleted"}


# Dashboard
@api_router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard(month: int, year: int, db: AsyncSession = Depends(get_db)):
    # Get all incomes
    result = await db.execute(select(IncomeDB))
    all_incomes = result.scalars().all()
    
    total_income = 0.0
    for income in all_incomes:
        if income.date.month == month and income.date.year == year:
            total_income += income.amount
        elif income.is_recurring:
            total_income += income.amount
    
    # Get fixed expenses for the month
    result = await db.execute(
        select(FixedExpenseMonthDB)
        .where(FixedExpenseMonthDB.month == month, FixedExpenseMonthDB.year == year)
    )
    fixed_expenses = result.scalars().all()
    
    # Get variable expenses for the month
    result = await db.execute(select(VariableExpenseDB))
    all_variable = result.scalars().all()
    variable_expenses = [e for e in all_variable if e.date.month == month and e.date.year == year]
    
    total_expenses = sum(e.amount for e in fixed_expenses) + sum(e.amount for e in variable_expenses)
    balance = total_income - total_expenses
    
    # Emergency reserve
    result = await db.execute(select(EmergencyReserveDB))
    reserves = result.scalars().all()
    emergency_reserve = sum(r.amount for r in reserves)
    balance_with_reserve = balance + emergency_reserve
    
    # Pending expenses
    pending_expenses = []
    for exp in fixed_expenses:
        if exp.status == "pending":
            pending_expenses.append({
                "id": exp.id,
                "name": exp.name,
                "amount": exp.amount,
                "due_day": exp.due_day,
                "type": "fixed"
            })
    
    for exp in variable_expenses:
        if exp.status == "pending":
            pending_expenses.append({
                "id": exp.id,
                "name": exp.name,
                "amount": exp.amount,
                "date": exp.date.isoformat(),
                "type": "variable"
            })
    
    # Expenses by category
    result = await db.execute(select(CategoryDB))
    categories = result.scalars().all()
    category_map = {cat.id: {"name": cat.name, "icon": cat.icon} for cat in categories}
    
    expenses_by_category = {}
    for exp in fixed_expenses:
        cat_id = exp.category_id
        if cat_id not in expenses_by_category:
            expenses_by_category[cat_id] = 0
        expenses_by_category[cat_id] += exp.amount
    
    for exp in variable_expenses:
        cat_id = exp.category_id
        if cat_id not in expenses_by_category:
            expenses_by_category[cat_id] = 0
        expenses_by_category[cat_id] += exp.amount
    
    # Calculate percentages
    expenses_by_category_list = []
    for cat_id, amount in expenses_by_category.items():
        cat_info = category_map.get(cat_id, {"name": "Outros", "icon": "📦"})
        percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
        expenses_by_category_list.append({
            "category_id": cat_id,
            "category_name": cat_info["name"],
            "category_icon": cat_info["icon"],
            "amount": amount,
            "percentage": percentage
        })
    
    # Alerts
    alerts = []
    if balance < 0:
        alerts.append({
            "type": "warning",
            "message": f"Saldo negativo de R$ {abs(balance):.2f}"
        })
    
    if len(pending_expenses) > 0:
        alerts.append({
            "type": "info",
            "message": f"{len(pending_expenses)} despesa(s) pendente(s)"
        })
    
    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance,
        emergency_reserve=emergency_reserve,
        balance_with_reserve=balance_with_reserve,
        pending_expenses=pending_expenses,
        expenses_by_category=expenses_by_category_list,
        alerts=alerts
    )


# Include router in app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event to create tables
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
