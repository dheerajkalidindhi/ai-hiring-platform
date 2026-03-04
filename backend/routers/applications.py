import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from database import get_db
from security import require_role
from schemas import UpdateApplicationStatus
from models import Application, Job
from services.resume_service import extract_text_from_pdf
from services.application_service import (
    apply_to_job_service,
    update_application_status_service,
    get_candidate_applications_service
)

router = APIRouter(tags=["Applications"])


# Apply to job with resume upload
from fastapi import UploadFile, File


@router.post("/jobs/{job_id}/apply")
def apply_to_job(
    job_id: int,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("candidate"))
):
    return apply_to_job_service(
        db=db,
        job_id=job_id,
        user_id=current_user["user_id"],
        resume_file=resume
    )


# Candidate view their applications
@router.get("/my-applications")
def get_candidate_applications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("candidate"))
):
    return get_candidate_applications_service(
        db=db,
        user_id=current_user["user_id"]
    )


#  Recruiter update application status (Enum dropdown)
@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    data: UpdateApplicationStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    return update_application_status_service(
        db=db,
        application_id=application_id,
        recruiter_id=current_user["user_id"],
        status=data.status
    )

@router.get("/applications/{application_id}/resume")
def download_resume(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("recruiter"))
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Ensure recruiter owns the job
    if application.job.recruiter_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    file_path = os.path.join("uploads", application.resume_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")

    return FileResponse(
        path=file_path,
        filename=application.resume_filename,
        media_type="application/pdf"
    )