from google.cloud import firestore

db = firestore.Client()

doc_ref = db.collection("test_collection").document("test_doc")
doc_ref.set({
    "message": "Hello Firestore!",
    "status": "connected"
})

print("Data written to Firestore successfully")
