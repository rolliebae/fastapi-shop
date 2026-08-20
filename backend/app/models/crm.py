from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    telegram: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    parent_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    parent_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
    exam: Mapped[str | None] = mapped_column(String(40), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="lead", index=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    owner: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deals: Mapped[list["Deal"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    activities: Mapped[list["Activity"]] = relationship(back_populates="student", cascade="all, delete-orphan")


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    stage: Mapped[str] = mapped_column(String(40), default="new", index=True)
    product: Mapped[str] = mapped_column(String(120), default="ОГЭ математика")
    amount: Mapped[float] = mapped_column(Float, default=0)
    probability: Mapped[int] = mapped_column(Integer, default=10)
    next_contact_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    lost_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student: Mapped[Student] = relationship(back_populates="deals")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    kind: Mapped[str] = mapped_column(String(40), index=True)
    text: Mapped[str] = mapped_column(Text)
    happened_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    student: Mapped[Student] = relationship(back_populates="activities")
