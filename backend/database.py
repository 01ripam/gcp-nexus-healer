import os
from dotenv import load_dotenv
from google.cloud import firestore

# 1. This line reads your .env file
load_dotenv()

def get_firestore_client():
    # 2. This looks for the path we put in the .env file
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    if not key_path:
        raise Exception("Error: GOOGLE_APPLICATION_CREDENTIALS not found in .env file")

    # 3. Initialize the database
    return firestore.Client()

# Test the connection
if __name__ == "__main__":
    try:
        db = get_firestore_client()
        print("✅ Success! Backend is connected to Google Cloud.")
    except Exception as e:
        print(f"❌ Failed: {e}")