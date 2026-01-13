import os
import hashlib
import shutil
from google.cloud import firestore
from database import get_firestore_client

# Absolute Pathing
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")
BACKUP_DIR = os.path.join(os.path.dirname(BASE_DIR), "backups")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

def calculate_hash(file_path):
    sha256 = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)
        return sha256.hexdigest()
    except: return None

def log_event(filename, event, action, severity="INFO"):
    db = get_firestore_client()
    if not db: return
    try:
        db.collection('logs').add({
            "file": filename, "event": event, "action": action,
            "timestamp": firestore.SERVER_TIMESTAMP, "severity": severity
        })
    except: pass

def create_backup(filename):
    try:
        shutil.copy2(os.path.join(DATA_DIR, filename), os.path.join(BACKUP_DIR, filename))
        return True
    except: return False

def check_and_heal():
    db = get_firestore_client()
    if not db: return {"healed": 0}
    healed_count = 0
    for filename in os.listdir(DATA_DIR):
        file_path = os.path.join(DATA_DIR, filename)
        if not os.path.isfile(file_path): continue
        
        current_hash = calculate_hash(file_path)
        doc_ref = db.collection('files').document(filename)
        doc = doc_ref.get()

        if not doc.exists:
            doc_ref.set({"file": filename, "hash": current_hash, "status": "healthy"})
            continue

        if current_hash == doc.to_dict().get('hash'):
            doc_ref.update({"status": "healthy"})
        else:
            backup_path = os.path.join(BACKUP_DIR, filename)
            if os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
                # RESET TO REPAIRED AND UPDATE HASH
                new_hash = calculate_hash(file_path)
                doc_ref.update({"status": "repaired", "hash": new_hash})
                log_event(filename, "INTEGRITY_VIOLATION", "REPAIRED_FROM_BACKUP", "HIGH")
                healed_count += 1
            else:
                doc_ref.update({"status": "at_risk"})
                log_event(filename, "CORRUPTION_DETECTED", "NO_BACKUP_AVAILABLE", "CRITICAL")
    return {"healed": healed_count}