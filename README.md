# 🛡️ SENTINEL: NexusHealer v1.0
### **GCP-Powered Autonomous Integrity Enforcement Engine**

[![Framework: Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Backend: Python](https://img.shields.io/badge/Backend-Python%20Flask-blue?style=flat-square&logo=python)](https://flask.palletsprojects.com/)
[![Database: Firestore](https://img.shields.io/badge/Database-GCP%20Firestore-orange?style=flat-square&logo=google-cloud)](https://cloud.google.com/firestore)

> **"Silent data corruption is the silent killer of enterprise storage. Sentinel detects it, logs it, and heals it—autonomously."**

---

## 📖 Overview
**Sentinel** is a proactive security layer for distributed storage systems. Unlike traditional monitoring that simply alerts a human, Sentinel uses **SHA-256 Cryptographic Hashing** and **GCP Firestore** to identify "Bit Rot" or unauthorized tampering and executes an atomic self-healing protocol to restore data integrity instantly.

## 🚀 The Problem & The Solution

| The Problem | Our Solution |
| :--- | :--- |
| **Silent Data Corruption:** Files can degrade over time without users knowing. | **SHA-256 Verification:** Constant integrity audits using cryptographic fingerprints. |
| **Reactive Maintenance:** Humans have to manually restore from backups after a failure. | **Autonomous Healing:** Real-time, zero-touch restoration from secure backup shards. |
| **Audit Gaps:** Lack of transparency in when and how data was corrupted. | **Immutable Logs:** A permanent, millisecond-accurate audit trail stored in GCP Firestore. |

---

## ✨ Key Features

*   **⚡ Automated Integrity Watchdog:** Scans storage clusters for hash mismatches every few seconds.
*   **🛠️ Atomic Recovery:** Instant file reconstruction using healthy shards.
*   **📊 Enterprise Dashboard:** A Next.js 14 "Command Center" featuring real-time health scores and security pulses.
*   **📑 Audit Trail:** Comprehensive logging of all detection and repair events for forensic compliance.
*   **🔒 Zero-Trust Security:** Decoupled architecture separating storage nodes from security logic.

---

## 🏗️ Architecture
1. **The Registry**: Every file is registered with a unique SHA-256 hash in **Firestore**.
2. **The Monitor**: A Python-based engine continuously compares the live file hash against the "Source of Truth."
3. **The Healer**: Upon mismatch, the system pulls from the `/backups/` shard and overwrites the corrupted file.
4. **The UI**: A high-performance **Next.js** dashboard displays the system's live security posture.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), Lucide-React, Axios
- **Backend:** Python Flask, Python-Dotenv
- **Cloud Database:** Google Cloud Firestore (GCP)
- **Security:** SHA-256 Hashing, HMAC validation logic

---

## ⚙️ Installation & Setup for Judges

### 1. Prerequisites
- Python 3.10+ & Node.js 18+
- A Google Cloud Service Account Key (`.json`)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Place your serviceAccountKey.json in /secrets/GCP_keys/
python app.py
