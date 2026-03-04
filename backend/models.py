from sqlalchemy import JSON, Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from database import Base


# =========================
# USERS
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "recruiter" or "candidate"
    created_at = Column(DateTime, default=datetime.utcnow)
    company_name = Column(String, nullable=True)

    # Relationships
    jobs = relationship("Job", back_populates="recruiter", cascade="all, delete")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete")


# =========================
# JOBS
# =========================
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    skills = Column(String)  # comma separated skills
    
    location = Column(String)
    salary = Column(Integer)

    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    

    # Relationships
    recruiter = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete")


# =========================
# APPLICATIONS
# =========================
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    status = Column(String, default="pending")
    ai_score = Column(Float, nullable=True)

    resume_filename = Column(String, nullable=True)   
    resume_text = Column(Text, nullable=True) 
    extracted_skills = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="applications")

    explanation = Column(JSON, nullable=True)