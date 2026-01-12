import os
from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()

# Connect to Firestore
db = firestore.Client()

def seed_nodes():
    nodes = [
        {"name": "Node-Alpha", "status": "Active", "usage": 45, "location": "New York"},
        {"name": "Node-Beta", "status": "Active", "usage": 12, "location": "London"},
        {"name": "Node-Gamma", "status": "Down", "usage": 0, "location": "Tokyo"}, # One is down for the "Healing" demo!
        {"name": "Node-Delta", "status": "Active", "usage": 78, "location": "Paris"},
        {"name": "Node-Epsilon", "status": "Active", "usage": 33, "location": "Mumbai"},
    ]

    print("🌱 Seeding data to Firestore...")
    for node in nodes:
        # This creates a 'nodes' collection and adds documents
        db.collection('nodes').document(node['name']).set(node)
        print(f"Added {node['name']}")
    print("✅ Done! Your database is ready.")

if __name__ == "__main__":
    seed_nodes()