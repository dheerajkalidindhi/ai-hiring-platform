from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# =========================
# USERS
# =========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    role: str  # "admin" or "candidate"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# =========================
# JOBS
# =========================

class JobCreate(BaseModel):
    title: str
    company_name: str 
    description: str
    skills: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[int] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[int] = None


class JobResponse(BaseModel):
    id: int
    title: str
    company_name: str 
    description: str
    skills: Optional[str]
    location: Optional[str]
    salary: Optional[int]
    recruiter_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecruiterJobResponse(BaseModel):
    id: int
    title: str
    company_name: str | None = None
    description: str
    skills: str 
    location: str 
    salary: int | None = None
    applications_count: int

    class Config:
        from_attributes = True

class PublicJobResponse(BaseModel):
    id: int
    title: str
    company_name: str | None = None
    description: str
    skills: Optional[str]
    location: Optional[str]
    salary: Optional[int]
    applications_count: int

    class Config:
        from_attributes = True

# =========================
# APPLICATIONS
# =========================

class ApplicationCreate(BaseModel):
    skills: str

class ApplicationStatus(str, Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    rejected = "rejected"
    hired = "hired"

class UpdateApplicationStatus(BaseModel):
    status: ApplicationStatus

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    ai_score: Optional[float]
    created_at: datetime

class Config:
    from_attributes = True

