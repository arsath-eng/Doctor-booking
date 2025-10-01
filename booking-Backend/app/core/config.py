# app/core/config.py

from datetime import time

# --- Booking Time Settings ---

# Time when booking opens each day
BOOKING_START_TIME = time(8, 0, 0)

# Duration of each appointment slot in minutes
SLOT_DURATION_MINUTES = 5

# --- Daily Session Definitions ---
# The 'end' time is exclusive (e.g., morning ends just before 12:00)
SESSIONS = {
    "morning": {
        "start": time(9, 0, 0),
        "end": time(12, 0, 0)
    },
    "evening": {
        "start": time(12, 0, 0),
        "end": time(17, 0, 0)  # 5 PM
    },
    "night": {
        "start": time(17, 0, 0), # 5 PM
        "end": time(23, 59, 59) # Up to midnight
    }
}