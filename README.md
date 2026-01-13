# SENTINEL v1.0: GCP-Powered Self-Healing Storage

### 🛡️ The Problem
Distributed storage systems are prone to silent data corruption and accidental deletions. 

### 🚀 Our Solution
Sentinel is an automated integrity enforcement engine. It uses **SHA-256 Hashing** to detect file corruption and **Google Firestore** to maintain an immutable audit trail. When a file is tampered with, the system automatically reconstructs it from a secure backup shard instantly.

### 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), Lucide Icons, Axios.
- **Backend**: Python Flask.
- **Database**: Google Cloud Firestore.
- **Integrity Logic**: Custom SHA-256 hashing & Automated Recovery.

### ⚙️ Setup for Judges
1. **Backend**: 
   - `cd backend`
   - `pip install -r requirements.txt`
   - Add your `serviceAccountKey.json` to `/secrets/GCP_keys/`
   - `python app.py`
2. **Frontend**:
   - `cd nexus-frontend`
   - `npm install`
   - `npm run dev`