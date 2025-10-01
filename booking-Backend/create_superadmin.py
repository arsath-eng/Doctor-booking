# create_superadmin.py
import sys
# Add app path to allow imports
sys.path.append('./')

from app.database import SessionLocal, engine
from app.models import SuperAdmin
from app.auth import get_password_hash

db = SessionLocal()

# --- DEFINE YOUR SUPER ADMIN CREDENTIALS HERE ---
SUPERADMIN_USERNAME = "superadmin"
SUPERADMIN_PASSWORD = "admin"

# Check if super admin already exists
existing_super_admin = db.query(SuperAdmin).filter(SuperAdmin.username == SUPERADMIN_USERNAME).first()

if existing_super_admin:
    print(f"Super admin '{SUPERADMIN_USERNAME}' already exists.")
else:
    hashed_password = get_password_hash(SUPERADMIN_PASSWORD)
    super_admin = SuperAdmin(username=SUPERADMIN_USERNAME, hashed_password=hashed_password)
    db.add(super_admin)
    db.commit()
    print(f"Super admin '{SUPERADMIN_USERNAME}' created successfully.")

db.close()