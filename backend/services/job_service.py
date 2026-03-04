from sqlalchemy.orm import Session
from fastapi import HTTPException

from models import Job, Application


# -------------------------------------------------
# CREATE JOB
# -------------------------------------------------
def create_job_service(
    db: Session,
    title: str,
    description: str,
    recruiter_id: int,
    skills: str = None,
    location: str = None,
    salary: int = None,
    company_name: str = None
):
    new_job = Job(
        title=title,
        description=description,
        recruiter_id=recruiter_id,
        skills=skills,
        location=location,
        salary=salary,
        company_name=company_name
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# -------------------------------------------------
# GET ALL JOBS (Public)
# -------------------------------------------------
def get_all_jobs_service(db: Session):
    jobs = db.query(Job).all()

    result = []

    for job in jobs:
        result.append({
            "id": job.id,
            "company_name": job.company_name,
            "title": job.title,
            "description": job.description,
            "skills": job.skills,
            "location": job.location,
            "salary": job.salary,
            "applications_count": len(job.applications)
        })

    return result


# -------------------------------------------------
# UPDATE JOB
# -------------------------------------------------
def update_job_service(
    db: Session,
    job_id: int,
    recruiter_id: int,
    title=None,
    description=None,
    skills=None,
    location=None,
    salary=None
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if title is not None:
        job.title = title

    if description is not None:
        job.description = description

    if skills is not None:
        job.skills = skills

    if location is not None:
        job.location = location

    if salary is not None:
        job.salary = salary

    db.commit()
    db.refresh(job)

    return job


# -------------------------------------------------
# DELETE JOB
# -------------------------------------------------
def delete_job_service(db: Session, job_id: int, recruiter_id: int):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(job)
    db.commit()

    return {"message": "Job deleted successfully"}


# -------------------------------------------------
# RECRUITER JOBS + LEADERBOARD
# -------------------------------------------------
def get_recruiter_jobs_service(db: Session, recruiter_id: int):

    jobs = db.query(Job).filter(
        Job.recruiter_id == recruiter_id
    ).all()

    result = []

    for job in jobs:

        sorted_apps = sorted(
            job.applications,
            key=lambda x: x.ai_score or 0,
            reverse=True
        )

        leaderboard = []

        for index, app in enumerate(sorted_apps, start=1):
            leaderboard.append({
                "rank": index,
                "application_id": app.id,
                "candidate_id": app.candidate_id,
                "candidate_email": app.candidate.email,
                "status": app.status,
                "ai_score": app.ai_score,
                "explanation": app.explanation
            })

        result.append({
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "description": job.description,
            "skills": job.skills,
            "location": job.location,
            "salary": job.salary,  
            "applications_count": len(job.applications),
            "applications": leaderboard
            
        })

    return result