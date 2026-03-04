# AI Hiring Platform

An AI-assisted recruitment platform that helps recruiters evaluate candidates by automatically analysing resumes and ranking applicants based on how well they match a job description.

The system extracts skills from uploaded resumes, compares them with job requirements using semantic similarity, and produces an AI score along with an explanation that highlights matched and missing skills.

---

# Key Features

## Candidate Features

- Browse available job postings
- Upload resume (PDF)
- Apply to jobs
- View application status
- See AI score for each application

## Recruiter Features

- Create job postings
- View all applicants for a job
- Automatically ranked candidates by AI score
- AI explanation showing:
  - matched skills
  - missing skills
  - experience analysis
- Download candidate resumes
- Update application status (pending / hired / rejected)

---

# AI Evaluation System

The platform evaluates candidates using a **hybrid scoring model**.

Candidate resumes are analysed and compared with job requirements using three components.

---

## 1 Skill Matching (50%)

Extracted resume skills are compared with job skills.

Example:

Job requires

Python, FastAPI, Docker

Resume contains

Python, FastAPI, PostgreSQL

Matched skills

Python  
FastAPI

Missing skills

Docker

---

## 2 Semantic Similarity (30%)

Uses **Sentence Transformers** to measure semantic similarity between job requirements and candidate skills.

Model used:

sentence-transformers/all-MiniLM-L6-v2

This allows the system to detect related technologies.

Example:

Job requirement: REST APIs  
Resume skill: FastAPI

Even if wording differs, semantic similarity detects the relationship.

---

## 3 Experience Detection (20%)

Resume text is scanned to estimate years of experience.

Example text detected:

"3 years experience in backend development"

This is compared against the required experience.

---

## Final AI Score

Final Score =  
0.5 × Skill Match  
0.3 × Semantic Similarity  
0.2 × Experience Score

Candidate classification:

Score >= 75 → High Fit  
Score 50-74 → Medium Fit  
Score < 50 → Low Fit

---

# System Architecture

Frontend (React)

↓

REST API

↓

Backend (FastAPI)

↓

Database (PostgreSQL)

↓

AI Services  
Sentence Transformers + Resume Parser

---

# Tech Stack

Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Sentence Transformers

Frontend
- React
- Axios
- TailwindCSS

Database
- PostgreSQL
- Managed through DBeaver

Infrastructure
- Docker
- Docker Compose

---

# Project Structure

ai-hiring-platform
backend
│
├── routers
├── services
├── models
├── schemas
├── database.py
└── main.py
frontend
│
├── src
├── pages
└── services
uploads
docker-compose.yml
README.md
.gitignore

---

# Database

The project uses **PostgreSQL** as the primary database.

Database management is performed using **DBeaver**.

Tables include:

Users  
Jobs  
Applications

Relationships:

Recruiter → creates Jobs  
Candidate → applies to Jobs  
Application → stores resume analysis and AI score

---

# Running the Project Locally

## 1 Install Requirements

Install:

- Python 3.10+
- Node.js
- Docker Desktop
- DBeaver (optional for database management)

---

## 2 Clone Repository

git clone https://github.com/YOUR_USERNAME/ai-hiring-platform.git

cd ai-hiring-platform

---

## 3 Start the System with Docker

docker compose up --build

Docker will start:

Backend container  
Frontend container  
PostgreSQL container

---

## 4 Access the Application

Frontend

http://localhost:5173

Backend API Docs

http://localhost:8000/docs

---

# Deployment

The application can be deployed using Docker containers.

## Build Containers

docker compose build

## Start Containers

docker compose up -d

---

## Deployment Options

You can deploy the system on:

AWS EC2  
Render  
Railway  
DigitalOcean  
Google Cloud  
Kubernetes (for scaling)

---

# Future Improvements

Potential upgrades:

- LLM-based recruiter insights
- Automatic interview scheduling
- Email notifications
- Resume ranking dashboard
- Multi-company recruiter accounts
- Improved resume parsing

---

# Author

Dheeraj Varma