# app/crud.py

from sqlalchemy.orm import Session
from datetime import date, time, timedelta
from typing import List

from . import models, schemas
from .core.config import SESSIONS
from . import auth

# --- User CRUD ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_phone(db: Session, phone_number: str):
    return db.query(models.User).filter(models.User.phone_number == phone_number).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, phone_number=user.phone_number)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Booking CRUD ---

def get_booking_by_slot(db: Session, booking_date: date, timeslot: time):
    """Check if a specific timeslot on a specific date is already booked."""
    return db.query(models.Booking).filter(
        models.Booking.date == booking_date,
        models.Booking.timeslot == timeslot
    ).first()

def get_session_for_timeslot(timeslot: time) -> str | None:
    """Determine the session for a given timeslot from config."""
    for session_name, timings in SESSIONS.items():
        if timings["start"] <= timeslot < timings["end"]:
            return session_name
    return None

def get_next_order_number(db: Session, booking_date: date, session: str) -> int:
    """Calculate the next order number for a given session on a specific date."""
    last_booking = db.query(models.Booking).filter(
        models.Booking.date == booking_date,
        models.Booking.session == session
    ).order_by(models.Booking.order_number.desc()).first()

    if last_booking:
        return last_booking.order_number + 1
    return 1

def update_turn_numbers_for_session(db: Session, booking_date: date, session: str):
    """
    Recalculates and updates the turn number for all bookings in a given session,
    ordered by their timeslot.
    """
    # 1. Get all bookings for the session, ordered chronologically
    session_bookings = db.query(models.Booking).filter(
        models.Booking.date == booking_date,
        models.Booking.session == session
    ).order_by(models.Booking.timeslot.asc()).all()

    # 2. Iterate and update the turn number based on the order
    for index, booking in enumerate(session_bookings):
        booking.turn_number = index + 1
    
    # 3. Commit the changes to the database
    db.commit()

def create_booking(db: Session, booking: schemas.BookingCreate):
    # 1. Determine the session for the given timeslot
    session_name = get_session_for_timeslot(booking.timeslot)
    if not session_name:
        return None 

    # 2. Calculate the next order number for this session and date
    next_order = get_next_order_number(
        db=db,
        booking_date=booking.date,
        session=session_name
    )

    # 3. Create the new booking record (turn_number is initially null)
    db_booking = models.Booking(
        user_id=booking.user_id,
        date=booking.date,
        timeslot=booking.timeslot,
        session=session_name,
        order_number=next_order,
        turn_number=0  # <-- Set a temporary value like 0 or None
    )
    db.add(db_booking)
    db.commit()
    # At this point, the new booking is saved in the database

    # --- NEW LOGIC TO ADD ---
    # 4. Update turn numbers for the entire session
    update_turn_numbers_for_session(
        db=db,
        booking_date=booking.date,
        session=session_name
    )
    # --- END OF NEW LOGIC ---

    # 5. Refresh the instance to get the updated turn_number
    db.refresh(db_booking)
    return db_booking


# --- Admin CRUD ---
def get_admin_by_username(db: Session, username: str):
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def get_admins(db: Session):
    return db.query(models.Admin).all()

def create_admin(db: Session, admin: schemas.AdminCreate):
    hashed_password = auth.get_password_hash(admin.password)
    db_admin = models.Admin(username=admin.username, hashed_password=hashed_password)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def delete_admin(db: Session, admin_id: int):
    db_admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if db_admin:
        db.delete(db_admin)
        db.commit()
        return True
    return False

# --- Super Admin CRUD ---
def get_super_admin_by_username(db: Session, username: str):
    return db.query(models.SuperAdmin).filter(models.SuperAdmin.username == username).first()


def get_bookings_for_date(db: Session, target_date: date) -> List[models.Booking]:
    """Gets all bookings for a specific date, ordered by turn number."""
    return db.query(models.Booking).filter(models.Booking.date == target_date).order_by(models.Booking.turn_number.asc()).all()

def get_booking_counts_for_last_n_days(db: Session, n_days: int) -> List[dict]:
    """Calculates the total number of bookings for each of the last N days."""
    today = date.today()
    trend_data = []
    for i in range(n_days):
        current_date = today - timedelta(days=i)
        count = db.query(models.Booking).filter(models.Booking.date == current_date).count()
        trend_data.append({"date": current_date.isoformat(), "bookings": count})
    
    # Return in chronological order
    return list(reversed(trend_data))
