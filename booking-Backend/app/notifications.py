# app/notifications.py
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Load credentials from .env file
TEXTLK_API_TOKEN = os.getenv("TEXTLK_API_TOKEN")
TEXTLK_SENDER_ID = os.getenv("TEXTLK_SENDER_ID")

# Text.lk API endpoint
TEXTLK_API_URL = "https://app.text.lk/api/http/sms/send"


# --- New Phone Number Formatting Function ---
def format_sri_lankan_phone_number(phone_number: str) -> str:
    """
    Formats a Sri Lankan phone number to the international standard required by Text.lk.
    - Removes leading '+' if present.
    - Replaces a leading '0' with '94'.
    - Assumes numbers already starting with '94' are correct.
    """
    # Remove any spaces or dashes first for clean processing
    cleaned_number = phone_number.strip().replace(" ", "").replace("-", "")

    if cleaned_number.startswith('0') and len(cleaned_number) == 10:
        # It's a local number like 0712345678, convert it
        return f"94{cleaned_number[1:]}"
    elif cleaned_number.startswith('+94'):
        # It's a number like +94712345678, just remove the '+'
        return cleaned_number[1:]
    
    # Otherwise, assume the number is already in the correct format (e.g., 94712345678)
    return cleaned_number


def send_sms_notification(phone_number: str, message: str):
    """
    Sends an SMS notification using the Text.lk gateway.
    In development, if Text.lk is not configured, it prints to the console.
    """
    if not TEXTLK_API_TOKEN or not TEXTLK_SENDER_ID:
        print("--- SMS SIMULATION (Text.lk) ---")
        # Format the phone number even in simulation for consistency
        formatted_number = format_sri_lankan_phone_number(phone_number)
        print(f"To (Formatted): {formatted_number}")
        print(f"From: {TEXTLK_SENDER_ID or 'Not Configured'}")
        print(f"Message: {message}")
        print("--- (Text.lk is not configured in .env) ---")
        return True, "SMS simulated successfully."

    # Format the phone number to the required international format
    formatted_recipient = format_sri_lankan_phone_number(phone_number)

    params = {
        "recipient": formatted_recipient,
        "sender_id": TEXTLK_SENDER_ID,
        "message": message,
        "api_token": TEXTLK_API_TOKEN
    }

    try:
        with httpx.Client() as client:
            response = client.get(TEXTLK_API_URL, params=params)
            response.raise_for_status() # Raises an exception for 4xx or 5xx status codes
        
        response_data = response.json()

        if response_data.get("status") == "success":
            print(f"SMS sent successfully via Text.lk to {formatted_recipient}")
            return True, response_data.get("message", "Notification sent successfully.")
        else:
            error_message = response_data.get("message", "Unknown error from Text.lk")
            print(f"Error from Text.lk API: {error_message}")
            return False, error_message

    except httpx.HTTPStatusError as e:
        print(f"HTTP error sending SMS via Text.lk: {e}")
        return False, "Failed to connect to the SMS gateway."
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False, "An unexpected error occurred while sending the SMS."