import os
import hashlib
import shutil
try:
    from google.cloud import firestore
except Exception:
    firestore = None

from database import get_firestore_client

# Lazy DB client (may be None if credentials are missing)
db = None

# --- SMART PATH FIX ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")
BACKUP_DIR = os.path.join(os.path.dirname(BASE_DIR), "backups")

# Ensure folders exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

def calculate_hash(file_path):
    """Creates a unique fingerprint for a file"""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except FileNotFoundError:
        return None

def log_event(filename, event, action, severity="INFO"):
    """Helper to log events into Firestore"""
    # If Firestore isn't available, print to stdout instead of raising
    try:
        if db is None:
            # attempt to initialize lazily
            try:
                globals()['db'] = get_firestore_client()
            except Exception:
                print(f"LOG ({severity}) {filename}: {event} - {action}")
                return

        ts = firestore.SERVER_TIMESTAMP if firestore is not None else None
        payload = {
            "file": filename,
            "event": event,
            "action": action,
            "timestamp": ts,
            "severity": severity
        }
        db.collection('logs').add(payload)
    except Exception as e:
        print(f"⚠️ Logging failed: {e}")

def check_and_heal():
    print(f"\n🔍 Scanning: {DATA_DIR}")
    
    # Ensure Firestore client is available if possible
    global db
    if db is None:
        try:
            db = get_firestore_client()
            globals()['db'] = db
        except Exception as e:
            print(f"⚠️ Firestore not available: {e}. Running in offline mode.")

    files_in_dir = os.listdir(DATA_DIR)
    if not files_in_dir:
        print("Empty folder. Add 'file1.txt' to the data folder!")
        return

    for filename in files_in_dir:
        file_path = os.path.join(DATA_DIR, filename)

        current_hash = calculate_hash(file_path)
        if not current_hash:
            continue

        # If Firestore isn't available, skip metadata checks
        if db is None:
            print(f"ℹ️ No Firestore: skipping metadata check for {filename}")
            continue

        doc_ref = db.collection('files').document(filename)
        try:
            doc = doc_ref.get()
        except Exception as e:
            print(f"⚠️ Firestore read failed for {filename}: {e}")
            log_event(filename, "FIRESTORE_READ_FAILED", str(e), "LOW")
            continue

        if not doc.exists:
            print(f"🆕 Registering new file: {filename}")
            doc_ref.set({
                "hash": current_hash,
                "status": "healthy",
                "last_checked": firestore.SERVER_TIMESTAMP
            })
            log_event(filename, "NEW_FILE", "REGISTERED", "LOW")
            continue

        original_hash = doc.to_dict().get('hash')

        if current_hash == original_hash:
            print(f"✅ {filename}: Healthy")
            doc_ref.update({
                "status": "healthy",
                "last_checked": firestore.SERVER_TIMESTAMP
            })
            log_event(filename, "SCAN", "HEALTHY", "LOW")
        else:
            print(f"🚨 {filename}: CORRUPTED! Starting repair...")
            backup_path = os.path.join(BACKUP_DIR, filename)
            
            if os.path.exists(backup_path):
                try:
                    shutil.copy(backup_path, file_path)
                    # After copying, recompute the hash and update the stored value
                    repaired_hash = calculate_hash(file_path)
                    update_payload = {
                        "status": "repaired",
                        "last_repair": firestore.SERVER_TIMESTAMP
                    }
                    if repaired_hash:
                        update_payload["hash"] = repaired_hash
                    doc_ref.update(update_payload)
                    print(f"🛠️ {filename}: Successfully Repaired.")
                    log_event(filename, "CORRUPTION_DETECTED", "AUTO_REPAIRED", "HIGH")
                except Exception as e:
                    print(f"❌ Repair failed: {e}")
                    log_event(filename, "REPAIR_FAILED", str(e), "CRITICAL")
            else:
                print(f"❌ {filename}: No backup found in {BACKUP_DIR}")
                log_event(filename, "CORRUPTION_DETECTED", "NO_BACKUP", "CRITICAL")

if __name__ == "__main__":
    check_and_heal()