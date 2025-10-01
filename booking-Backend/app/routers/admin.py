# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List


from .. import dependencies
from .. import crud, schemas, auth, database
from datetime import date
from .. import notifications
from .. import models

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = None
    if form_data.role == 'superadmin':
        user = crud.get_super_admin_by_username(db, username=form_data.username)
    else: # role == 'admin'
        user = crud.get_admin_by_username(db, username=form_data.username)

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": form_data.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# NOTE: The following endpoints would need dependency injection for protection
# This is a simplified example. In a real app, add a dependency to verify JWT.

@router.post("/create-admin", response_model=schemas.Admin, status_code=status.HTTP_201_CREATED)
def create_new_admin(admin: schemas.AdminCreate, db: Session = Depends(database.get_db), current_user: dict = Depends(dependencies.get_current_super_admin)):
    db_admin = crud.get_admin_by_username(db, username=admin.username)
    if db_admin:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_admin(db=db, admin=admin)

@router.get("/list-admins", response_model=List[schemas.Admin])
def list_all_admins(db: Session = Depends(database.get_db), current_user: dict = Depends(dependencies.get_current_super_admin)):
    return crud.get_admins(db=db)

@router.delete("/delete-admin/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_admin(admin_id: int, db: Session = Depends(database.get_db), current_user: dict = Depends(dependencies.get_current_super_admin)):
    success = crud.delete_admin(db=db, admin_id=admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"ok": True}

@router.get("/dashboard-data", response_model=schemas.DashboardData)
def get_dashboard_data(
    date: date, # FastAPI will automatically parse 'YYYY-MM-DD' from the query string
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(dependencies.get_current_active_admin)
):
    # 1. Get all bookings for the selected date
    daily_bookings = crud.get_bookings_for_date(db=db, target_date=date)

    # 2. Calculate daily stats
    morning_count = 0
    evening_count = 0
    night_count = 0
    for booking in daily_bookings:
        session = crud.get_session_for_timeslot(booking.timeslot)
        if session == 'morning':
            morning_count += 1
        elif session == 'evening':
            evening_count += 1
        elif session == 'night':
            night_count += 1
            
    stats = schemas.DashboardStats(
        totalBookings=len(daily_bookings),
        morning=morning_count,
        evening=evening_count,
        night=night_count
    )

    # 3. Get the 7-day booking trend
    weekly_trend_data = crud.get_booking_counts_for_last_n_days(db=db, n_days=7)
    
    # 4. Assemble and return the final data structure
    return schemas.DashboardData(
        stats=stats,
        bookings=daily_bookings,
        weeklyTrend=weekly_trend_data
    )


# --- ADD THIS NEW ENDPOINT ---
@router.post("/notify/{booking_id}", status_code=status.HTTP_200_OK)
def send_patient_notification(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(dependencies.get_current_active_admin)
):
    # 1. Fetch the booking from the database
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # 2. Construct the notification message
    patient_name = booking.user.name
    turn_number = booking.turn_number
    time_slot = booking.timeslot.strftime('%I:%M %p') # Format time to 12-hour clock
    
    message = (
        f"Hi {patient_name}, this is a reminder from Maryam Medicare. "
        f"Your turn number ({turn_number}) is approaching. "
        f"Your appointment is at {time_slot}. Please be ready."
    )
    
    # 3. Send the notification
    success, status_message = notifications.send_sms_notification(
        phone_number=booking.user.phone_number,
        message=message
    )

    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send notification: {status_message}")

    return {"message": status_message}