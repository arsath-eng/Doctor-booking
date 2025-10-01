# app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from datetime import timedelta
from . import crud, models, schemas
from .database import engine, get_db
from .core.config import SESSIONS, BOOKING_START_TIME, SLOT_DURATION_MINUTES
from fastapi.middleware.cors import CORSMiddleware
from .routers import admin

# Create database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor Booking API",
    description="API for booking doctor appointments with daily sessions."
)

origins = [
    "http://localhost:3000",  # The origin of your Next.js frontend
    # You can add your production frontend URL here as well
    # "https://your-production-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(admin.router)

@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_phone(db, phone_number=user.phone_number)
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/bookings/", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # --- Validation Logic ---
    # 1. Check if booking is open for the day
    if datetime.now().time() < BOOKING_START_TIME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Booking is not open yet. Please try after {BOOKING_START_TIME.strftime('%I:%M %p')}."
        )

    # 2. Check if the booking date is in the past
    if booking.date < date.today():
         raise HTTPException(status_code=400, detail="Cannot book appointments for past dates.")

    # 3. Check if the user exists
    db_user = crud.get_user(db, user_id=booking.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 4. Validate the timeslot (is it a valid 5-minute interval?)
    if booking.timeslot.minute % SLOT_DURATION_MINUTES != 0:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timeslot. Slots are in {SLOT_DURATION_MINUTES}-minute intervals."
        )

    # 5. Check if the timeslot falls within any session
    session = crud.get_session_for_timeslot(booking.timeslot)
    if not session:
        raise HTTPException(status_code=400, detail="Selected timeslot is outside of booking hours.")

    # 6. Check if the slot is already booked
    existing_booking = crud.get_booking_by_slot(db, booking_date=booking.date, timeslot=booking.timeslot)
    if existing_booking:
        raise HTTPException(status_code=409, detail="This timeslot is already booked.")

    # --- Create Booking ---
    new_booking = crud.create_booking(db=db, booking=booking)
    return new_booking

@app.get("/slots/{selected_date}", response_model=list[schemas.Booking])
def get_booked_slots_for_date(selected_date: date, db: Session = Depends(get_db)):
    """
    Returns a list of all bookings for a specific date.
    The frontend can then determine which slots are taken.
    """
    return db.query(models.Booking).filter(models.Booking.date == selected_date).all()

@app.post("/bookings/create_with_user", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
def create_booking_with_user(booking_data: schemas.BookingWithUserCreate, db: Session = Depends(get_db)):
    
    # --- New Validation Logic ---
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()

    # Block bookings for any date in the past
    if booking_data.date < current_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book appointments for past dates."
        )

    # If booking is for today, block any time slot that has already passed
    if booking_data.date == current_date and booking_data.timeslot < current_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book a time slot that has already passed today."
        )

    # --- Logic 3: Validate the timeslot is a correct 5-minute interval ---
    if booking_data.timeslot.minute % SLOT_DURATION_MINUTES != 0:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timeslot. Slots are in {SLOT_DURATION_MINUTES}-minute intervals."
        )

    # --- Logic 4: Check if the timeslot falls within any valid session ---
    session_name = crud.get_session_for_timeslot(booking_data.timeslot)
    if not session_name:
        raise HTTPException(status_code=400, detail="Selected timeslot is outside of booking hours.")

    # --- Logic 5: Check if the slot is already booked ---
    existing_booking = crud.get_booking_by_slot(db, booking_date=booking_data.date, timeslot=booking_data.timeslot)
    if existing_booking:
        raise HTTPException(status_code=409, detail="This timeslot is already booked.")

    # --- Logic 6: Find or create the user ---
    db_user = crud.get_user_by_phone(db, phone_number=booking_data.phone_number)
    if not db_user:
        user_schema = schemas.UserCreate(name=booking_data.name, phone_number=booking_data.phone_number)
        db_user = crud.create_user(db=db, user=user_schema)

    # --- Logic 7: Create the booking for the user ---
    booking_schema = schemas.BookingCreate(
        date=booking_data.date,
        timeslot=booking_data.timeslot,
        user_id=db_user.id
    )
    
    # This calls the crud function that calculates order_number and turn_number
    new_booking = crud.create_booking(db=db, booking=booking_schema)
    
    # This check is technically redundant because of Logic 4, but it's good practice
    if not new_booking:
         raise HTTPException(status_code=500, detail="Could not create booking.")

    return new_booking


@app.get("/")
def read_root():
    return {"message": "Welcome to the Doctor Booking API"}