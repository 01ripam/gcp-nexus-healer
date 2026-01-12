from google.cloud import firestore
import os
from dotenv import load_dotenv

load_dotenv() # This loads the path from your .env file

# This will now look for the path you set in .env
db = firestore.Client()
print("Credential path:", os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"))

db = firestore.Client()

print("✅ Firestore connected successfully!")

docs = db.collection("test").stream()
for doc in docs:
    print(doc.id, doc.to_dict())
