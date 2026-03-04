import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
from models import Application, Job
from services.ai_service import compute_ai_score
from services.resume_service import (
    extract_text_from_pdf,
    extract_skills_from_text,
    extract_years_of_experience
)

UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


def apply_to_job_service(db: Session, job_id: int, user_id: int, resume_file):

    # 1️⃣ Check job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2️⃣ Prevent duplicate application
    existing_application = db.query(Application).filter(
        Application.candidate_id == user_id,
        Application.job_id == job_id
    ).first()

    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied")

    # 3️⃣ Save resume file
    file_path = os.path.join(UPLOAD_DIR, resume_file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(resume_file.file.read())

    # 4️⃣ Extract resume text
    resume_text = extract_text_from_pdf(file_path)

    # 5️⃣ Extract structured skills
    skills_list = extract_skills_from_text(resume_text)
    skills_string = ", ".join(skills_list)

    # ---------------- HYBRID SCORING ----------------

    # STRICT skill matching (50%)
    job_skills = [s.strip().lower() for s in (job.skills or "").split(",") if s.strip()]
    candidate_skills = [s.lower() for s in skills_list]

    matched_skills = list(set(job_skills) & set(candidate_skills))
    missing_skills = list(set(job_skills) - set(candidate_skills))

    skill_match_score = (
        len(matched_skills) / len(job_skills)
        if job_skills else 0
    )

    # Semantic similarity (30%)
    semantic_score = compute_ai_score(job.skills or "", skills_string) / 100

    # Experience matching (20%)
    experience_years = extract_years_of_experience(resume_text)

    required_experience = 2  # Temporary fixed value
    experience_score = min(experience_years / required_experience, 1.0)

    # Final weighted score
    final_score = (
        0.5 * skill_match_score +
        0.3 * semantic_score +
        0.2 * experience_score
    )

    ai_score = round(final_score * 100, 2)

    # Determine fit level
    fit_level = "Low"

    if ai_score >= 75:
        fit_level = "High"
    elif ai_score >= 50:
        fit_level = "Medium"


    # Generate explanation
    summary_text = (
    f"Candidate matches {len(matched_skills)} out of {len(job_skills)} required skills. "
    f"Semantic similarity score is {round(semantic_score * 100,1)}%. "
    f"Detected experience: {experience_years} years. "
    f"Overall candidate fit is {fit_level}."
    )


    # Build recruiter-friendly summary
    
    missing_text = "none"
    if missing_skills:
        missing_text = ", ".join(missing_skills)
    
    matched_text = "none"
    if matched_skills:
        matched_text = ", ".join(matched_skills)
    
    experience_note = "below requirement"
    if experience_years >= required_experience:
        experience_note = "meets experience requirement"
    
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
    
    # 6️⃣ Create application
    application = Application(
        job_id=job_id,
        candidate_id=user_id,
        ai_score=ai_score,
        resume_filename=resume_file.filename,
        resume_text=resume_text,
        extracted_skills=skills_string,
        explanation=explanation
    )

    db.add(application)
    db.commit()
    
   

    return {
    "message": "Applied successfully",
    "ai_score": ai_score,
    "matched_skills": matched_skills,
    "missing_skills": missing_skills,
    "skill_score": round(skill_match_score, 2),
    "semantic_score": round(semantic_score, 2),
    "experience_score": round(experience_score, 2),
    "experience_years": experience_years,
    "explanation": explanation
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

    # Ensure recruiter owns job
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