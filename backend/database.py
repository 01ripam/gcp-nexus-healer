import os
from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()

def get_firestore_client():
    """Initializes and returns the Firestore client."""
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not key_path or not os.path.exists(key_path):
        print(f"⚠️ Warning: Service key not found at {key_path}")
        return None
    try:
        return firestore.Client()
    except Exception as e:
        print(f"❌ Firestore Error: {e}")
        return None

def is_firestore_available():
    return get_firestore_client() is not None