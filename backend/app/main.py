from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db, init_db
from .models import Activity, Deal, Student
from .schemas import ActivityCreate, ActivityOut, DashboardOut, DealCreate, DealOut, StudentCreate, StudentOut, StudentUpdate

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.post("/students", response_model=StudentOut, status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@app.get("/students", response_model=list[StudentOut])
def list_students(
    status: str | None = None,
    source: str | None = None,
    owner: str | None = None,
    q: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
):
    stmt = select(Student).order_by(Student.created_at.desc())
    if status:
        stmt = stmt.where(Student.status == status)
    if source:
        stmt = stmt.where(Student.source == source)
    if owner:
        stmt = stmt.where(Student.owner == owner)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            (Student.full_name.ilike(pattern))
            | (Student.phone.ilike(pattern))
            | (Student.telegram.ilike(pattern))
        )
    return db.scalars(stmt).all()


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.patch("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, payload: StudentUpdate, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@app.post("/deals", response_model=DealOut, status_code=201)
def create_deal(payload: DealCreate, db: Session = Depends(get_db)):
    if not db.get(Student, payload.student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    deal = Deal(**payload.model_dump())
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@app.get("/deals", response_model=list[DealOut])
def list_deals(stage: str | None = None, db: Session = Depends(get_db)):
    stmt = select(Deal).order_by(Deal.updated_at.desc())
    if stage:
        stmt = stmt.where(Deal.stage == stage)
    return db.scalars(stmt).all()


@app.post("/activities", response_model=ActivityOut, status_code=201)
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    if not db.get(Student, payload.student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    data = payload.model_dump()
    if data["happened_at"] is None:
        data["happened_at"] = datetime.utcnow()
    activity = Activity(**data)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@app.get("/students/{student_id}/activities", response_model=list[ActivityOut])
def list_student_activities(student_id: int, db: Session = Depends(get_db)):
    if not db.get(Student, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    stmt = select(Activity).where(Activity.student_id == student_id).order_by(Activity.happened_at.desc())
    return db.scalars(stmt).all()


@app.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    total_students = db.scalar(select(func.count(Student.id))) or 0
    leads = db.scalar(select(func.count(Student.id)).where(Student.status == "lead")) or 0
    active_students = db.scalar(select(func.count(Student.id)).where(Student.status == "active")) or 0
    won_deals = db.scalar(select(func.count(Deal.id)).where(Deal.stage == "won")) or 0
    open_deals = db.scalars(select(Deal).where(Deal.stage.notin_(["won", "lost"]))).all()
    open_pipeline_amount = sum(deal.amount for deal in open_deals)
    weighted_pipeline_amount = sum(deal.amount * deal.probability / 100 for deal in open_deals)
    return DashboardOut(
        total_students=total_students,
        leads=leads,
        active_students=active_students,
        won_deals=won_deals,
        open_pipeline_amount=open_pipeline_amount,
        weighted_pipeline_amount=weighted_pipeline_amount,
    )
