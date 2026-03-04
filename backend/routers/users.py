from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate
from security import hash_password, require_role, get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    }




@router.get("/me")
def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    return {
        "user_id": current_user["user_id"],
        "role": current_user["role"]
    }