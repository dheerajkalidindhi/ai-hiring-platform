import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
import asyncio
from models import Application, Job
from database import SessionLocal
from services.ai_service import compute_ai_score
from services.resume_service import (
    extract_text_from_pdf,
    extract_skills_from_text,
    extract_years_of_experience
)

UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def process_ai_evaluation_bg(application_id: int, job_id: int, user_id: int, file_path: str, filename: str):
    db: Session = SessionLocal()
    try:
        # 1. Check Job 
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return

        # 2. Extract Data
        resume_text = extract_text_from_pdf(file_path)
        skills_list = extract_skills_from_text(resume_text)
        skills_string = ", ".join(skills_list)

        # 3. Hybrid Scoring
        job_skills = [s.strip().lower() for s in (job.skills or "").split(",") if s.strip()]
        candidate_skills = [s.lower() for s in skills_list]

        matched_skills = list(set(job_skills) & set(candidate_skills))
        missing_skills = list(set(job_skills) - set(candidate_skills))

        skill_match_score = (
            len(matched_skills) / len(job_skills)
            if job_skills else 0
        )

        semantic_score = compute_ai_score(job.skills or "", skills_string) / 100
        experience_years = extract_years_of_experience(resume_text)
        required_experience = 2  # Temporary fixed
        experience_score = min(experience_years / required_experience, 1.0)

        final_score = (
            0.5 * skill_match_score +
            0.3 * semantic_score +
            0.2 * experience_score
        )
        ai_score = round(final_score * 100, 2)

        fit_level = "Low"
        if ai_score >= 75:
            fit_level = "High"
        elif ai_score >= 50:
            fit_level = "Medium"

        missing_text = "none" if not missing_skills else ", ".join(missing_skills)
        matched_text = "none" if not matched_skills else ", ".join(matched_skills)
        experience_note = "meets experience requirement" if experience_years >= required_experience else "below requirement"

        summary_text = (
            f"Matched skills: {matched_text}. "
            f"Missing important skills: {missing_text}. "
            f"Candidate experience: {experience_years} years ({experience_note}). "
            f"Overall recommendation: {fit_level} fit for the role."
        )

        explanation = json.dumps({
            "summary": summary_text,
            "skill_match": {
                "matched_count": len(matched_skills),
                "total_required": len(job_skills),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills
            },
            "semantic_score": round(semantic_score * 100, 1),
            "experience": {
                "years_detected": experience_years,
                "required_years": required_experience
            },
            "overall_fit": fit_level
        })

        # 4. Update Database
        application = db.query(Application).filter(Application.id == application_id).first()
        if application:
            application.ai_score = ai_score
            application.resume_text = resume_text
            application.extracted_skills = skills_string
            application.explanation = explanation
            application.status = "pending"  # finished processing, now pending review
            db.commit()

        # 5. Broadcast WebSocket 
        try:
            from routers.websockets import manager
            # Since this is a synchronous background task thread, create a new event loop
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            loop.run_until_complete(
                manager.send_personal_message(
                    {"type": "evaluation_complete", "application_id": application_id}, 
                    user_id
                )
            )
        except Exception as e:
            print(f"WS Broadcast Error: {e}")

    finally:
        db.close()

def apply_to_job_service(db: Session, job_id: int, user_id: int, resume_file, background_tasks):

    # 1. Check job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Prevent duplicate application
    existing_application = db.query(Application).filter(
        Application.candidate_id == user_id,
        Application.job_id == job_id
    ).first()

    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied")

    # 3. Save resume file
    file_path = os.path.join(UPLOAD_DIR, resume_file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(resume_file.file.read())

    # 4. Create application in 'processing' state
    application = Application(
        job_id=job_id,
        candidate_id=user_id,
        status="processing",
        resume_filename=resume_file.filename
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # 5. Trigger Background AI Evaluation
    background_tasks.add_task(
        process_ai_evaluation_bg, 
        application.id, 
        job_id, 
        user_id, 
        file_path, 
        resume_file.filename
    )

    return {
        "message": "Application submitted. AI evaluation is processing in the background.",
        "application_id": application.id
    }

def get_candidate_applications_service(db: Session, user_id: int):
    applications = db.query(Application).filter(
        Application.candidate_id == user_id
    ).all()

    result = []
    for app in applications:
        result.append({
            "application_id": app.id,
            "job_id": app.job_id,       
            "job_title": app.job.title,
            "status": app.status,
            "ai_score": app.ai_score
        })

    return result

def update_application_status_service(
    db: Session,
    application_id: int,
    recruiter_id: int,
    status: str
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    application.status = status
    db.commit()
    db.refresh(application)

    return {
        "message": "Status updated",
        "application_id": application.id,
        "new_status": status
    }