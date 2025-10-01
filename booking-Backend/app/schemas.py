# app/schemas.py

from pydantic import BaseModel, Field
from datetime import date, time
from typing import Literal
from typing import List
# --- User Schemas ---

class UserBase(BaseModel):
    name: str
    phone_number: str = Field(..., pattern=r"^\+?[0-9]{10,15}$") # Simple phone regex

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True # In Pydantic V1 this was orm_mode, in V2 it's from_attributes
        from_attributes = True


# --- Booking Schemas ---

class BookingBase(BaseModel):
    date: date
    timeslot: time

class BookingCreate(BookingBase):
    user_id: int

class BookingWithUserCreate(BookingBase):
    name: str
    phone_number: str = Field(..., pattern=r"^\+?[0-9]{10,15}$")

class Booking(BookingBase):
    id: int
    session: str
    order_number: int
    turn_number: int
    user: User # Nested User schema to show user details in the response

    class Config:
        orm_mode = True
        from_attributes = True


# --- Admin Schemas ---
class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: int
    class Config:
        from_attributes = True

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str
    role: Literal['admin', 'superadmin']

class Token(BaseModel):
    access_token: str
    token_type: str


class DashboardStats(BaseModel):
    totalBookings: int
    morning: int
    evening: int
    night: int

class WeeklyTrendItem(BaseModel):
    date: str
    bookings: int

class DashboardData(BaseModel):
    stats: DashboardStats
    bookings: List[Booking]  # Re-uses the existing Booking schema
    weeklyTrend: List[WeeklyTrendItem]