from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from security import require_role
from schemas import JobCreate, JobResponse, RecruiterJobResponse, PublicJobResponse
from models import Job
from services.job_service import (
    create_job_service,
    get_all_jobs_service,
    update_job_service,
    delete_job_service,
    get_recruiter_jobs_service
)

router = APIRouter(tags=["Jobs"])


# ✅ Create Job (Admin Only)
@router.post("/jobs", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    return create_job_service(
        db=db,  
        title=job.title,
        company_name=job.company_name,
        description=job.description,
        recruiter_id=current_user["user_id"],
        skills=job.skills,
        location=job.location,
        salary=job.salary
        
    )


# ✅ Get All Jobs (Authenticated Users)
@router.get("/jobs", response_model=list[PublicJobResponse] )
def get_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("candidate"))
):
    return get_all_jobs_service(db)


# ✅ Update Job (Admin Only)
@router.patch("/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    return update_job_service(
        db=db,
        job_id=job_id,
        recruiter_id=current_user["user_id"],
        title=job.title,
        description=job.description
    )


# ✅ Delete Job (Admin Only)
@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    return delete_job_service(
        db=db,
        job_id=job_id,
        recruiter_id=current_user["user_id"]
    )


# ✅ Recruiter Dashboard (Admin Only)
@router.get("/recruiter/jobs", response_model=list[RecruiterJobResponse])
def get_recruiter_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    return get_recruiter_jobs_service(
        db=db,
        recruiter_id=current_user["user_id"]
    )

@router.get("/recruiter/jobs/{job_id}/applications")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    sorted_apps = sorted(
        job.applications,
        key=lambda x: x.ai_score or 0,
        reverse=True
    )

    result = []

    for index, app in enumerate(sorted_apps, start=1):
        result.append({
            "application_id": app.id,
            "rank": index,
            "candidate_email": app.candidate.email,
            "status": app.status,
            "ai_score": app.ai_score,
            "explanation": app.explanation or "No explanation available"
        })

    return result