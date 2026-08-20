from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    full_name: str
    phone: str | None = None
    telegram: str | None = None
    parent_name: str | None = None
    parent_phone: str | None = None
    grade: int | None = Field(default=None, ge=1, le=11)
    exam: str | None = None
    subject: str | None = None
    status: str = "lead"
    source: str | None = None
    owner: str | None = None
    notes: str | None = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    telegram: str | None = None
    parent_name: str | None = None
    parent_phone: str | None = None
    grade: int | None = Field(default=None, ge=1, le=11)
    exam: str | None = None
    subject: str | None = None
    status: str | None = None
    source: str | None = None
    owner: str | None = None
    notes: str | None = None


class StudentOut(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DealCreate(BaseModel):
    student_id: int
    stage: str = "new"
    product: str = "ОГЭ математика"
    amount: float = 0
    probability: int = Field(default=10, ge=0, le=100)
    next_contact_at: datetime | None = None
    lost_reason: str | None = None


class DealUpdate(BaseModel):
    stage: str | None = None
    product: str | None = None
    amount: float | None = None
    probability: int | None = Field(default=None, ge=0, le=100)
    next_contact_at: datetime | None = None
    lost_reason: str | None = None


class DealOut(DealCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ActivityCreate(BaseModel):
    student_id: int
    kind: str
    text: str
    happened_at: datetime | None = None
    created_by: str | None = None


class ActivityOut(BaseModel):
    id: int
    student_id: int
    kind: str
    text: str
    happened_at: datetime
    created_by: str | None = None
    model_config = ConfigDict(from_attributes=True)


class DashboardOut(BaseModel):
    total_students: int
    leads: int
    active_students: int
    won_deals: int
    open_pipeline_amount: float
    weighted_pipeline_amount: float
