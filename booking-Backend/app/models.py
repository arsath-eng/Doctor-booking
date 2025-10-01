# app/models.py

from sqlalchemy import (Column, Integer, String, Date, Time, ForeignKey,
                        UniqueConstraint)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)

    bookings = relationship("Booking", back_populates="user")


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class SuperAdmin(Base):
    __tablename__ = "super_admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True)
    session = Column(String, index=True)
    timeslot = Column(Time)
    order_number = Column(Integer)
    turn_number = Column(Integer, index=True)
    
    user = relationship("User", back_populates="bookings")

    # Ensures that a specific timeslot on a specific date can only be booked once
    __table_args__ = (UniqueConstraint('date', 'timeslot', name='_date_timeslot_uc'),)