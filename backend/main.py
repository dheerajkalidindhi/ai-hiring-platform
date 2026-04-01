from fastapi import FastAPI
from sqlalchemy import text
from contextlib import asynccontextmanager

from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Routers
from routers import auth, users, jobs, applications, websockets


# ---------- Lifespan (Startup / Shutdown) ----------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful")
    except Exception as e:
        print("❌ Database connection failed")
        print(e)

    yield

    # Shutdown
    print("Shutting down application...")


# ---------- Create Tables ----------
Base.metadata.create_all(bind=engine)

# ---------- FastAPI App ----------
app = FastAPI(lifespan=lifespan)


# ---------- Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Register Routers ----------
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(websockets.router)


# ---------- Root ----------
@app.get("/")
def root():
    return {"message": "AI Recruitment API is running"}