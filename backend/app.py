import os
import shutil
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from healer import check_and_heal, log_event, create_backup, DATA_DIR, BACKUP_DIR
from database import get_firestore_client

load_dotenv()
app = Flask(__name__)
CORS(app) # Allow Next.js connection

db = get_firestore_client()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    ai_model = genai.GenerativeModel('gemini-1.5-flash')
except:
    ai_model = None

@app.route('/api/scan', methods=['POST'])
def run_scan():
    try:
        stats = check_and_heal()
        ai_backups = 0
        for filename in os.listdir(DATA_DIR):
            if not os.path.exists(os.path.join(BACKUP_DIR, filename)):
                should_backup = True
                if ai_model:
                    try:
                        res = ai_model.generate_content(f"Backup file {filename}? YES or NO.")
                        should_backup = "YES" in res.text.upper()
                    except: should_backup = True # Fail-safe

                if should_backup:
                    if create_backup(filename):
                        log_event(filename, "AI_AUTO_BACKUP", "SHIELD_CREATED", "LOW")
                        ai_backups += 1
        return jsonify({"message": "Audit Success", "healed": stats['healed'], "ai_backups": ai_backups})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard-stats', methods=['GET'])
def get_stats():
    try:
        files = [doc.to_dict() for doc in db.collection('files').stream()]
        logs = []
        logs_ref = db.collection('logs').order_by('timestamp', direction='DESCENDING').limit(15).stream()
        for d in logs_ref:
            l = d.to_dict()
            if l.get('timestamp'): l['timestamp'] = l['timestamp'].strftime("%H:%M:%S")
            logs.append(l)
        
        total = len(files)
        # LOGIC: healthy and repaired both count as 100% health
        unsafe = len([f for f in files if f.get('status') == 'at_risk'])
        health = 100 if total == 0 else int(((total - unsafe) / total) * 100)
        
        return jsonify({"files": files, "logs": logs, "health_score": health, "repair_total": len([l for l in logs if l.get('action') == 'REPAIRED_FROM_BACKUP'])})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/ai-insights', methods=['GET'])
def get_insights():
    try:
        res = ai_model.generate_content("Summarize system health in 1 professional sentence.")
        return jsonify({"insight": res.text})
    except: return jsonify({"insight": "AI Sentinel Monitoring Active."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)