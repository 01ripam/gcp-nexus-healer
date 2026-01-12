from flask import Flask, jsonify
from flask_cors import CORS
from database import get_firestore_client
from healer import check_and_heal
import time

app = Flask(__name__)
CORS(app)
db = get_firestore_client()

@app.route('/api/scan', methods=['POST'])
def run_scan():
    """Triggers the advanced healer logic"""
    try:
        check_and_heal()
        return jsonify({"status": "success", "message": "Global Integrity Audit Complete."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/dashboard-stats', methods=['GET'])
def get_stats():
    """Serves the polished data for the Sentinel UI"""
    try:
        # Fetch Files
        files = [doc.to_dict() for doc in db.collection('files').stream()]
        
        # Fetch Logs (Formatted for UI)
        logs_ref = db.collection('logs').order_by('timestamp', direction='DESCENDING').limit(15).stream()
        logs = []
        for doc in logs_ref:
            l = doc.to_dict()
            if l.get('timestamp'):
                l['timestamp'] = l['timestamp'].strftime("%b %d, %H:%M:%S")
            logs.append(l)

        # Calculate Professional KPIs
        total = len(files)
        repaired = len([l for l in logs if l.get('action') == 'REPAIRED_FROM_BACKUP'])
        corrupted = len([f for f in files if f.get('status') in ['corrupted', 'corrupted_no_backup']])
        
        health = 100 if total == 0 else int(((total - corrupted) / total) * 100)

        return jsonify({
            "files": files,
            "logs": logs,
            "health_score": health,
            "repair_total": repaired,
            "system_status": "OPERATIONAL" if health > 90 else "DEGRADED"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)