from database import SessionLocal, engine, Base
from models import User, Job
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

print("Dropping and recreating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created.")

db = SessionLocal()
try:
    user = User()
    user.email = 'test2@recruiter.com'
    user.password = hash_password('password123')
    user.role = 'recruiter'
    user.company_name = 'Acme Corp Verified'
    user.is_verified = True
    
    db.add(user)
    db.commit()
    db.refresh(user)

    job = Job()
    job.title = 'Senior Developer'
    job.company_name = 'Acme Corp Verified'
    job.description = 'Great verified job.'
    job.skills = 'react, node, sql'
    job.location = 'Remote'
    job.salary = 150
    job.recruiter_id = user.id
    
    db.add(job)
    db.commit()
    print('Seed complete.')
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
