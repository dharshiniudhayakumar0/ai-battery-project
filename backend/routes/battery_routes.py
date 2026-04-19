from flask import Blueprint, request, jsonify
from database.db import db
from database.models import BatteryData, Alert

battery_bp = Blueprint('battery', __name__)

TEMP_THRESHOLD = 45.0
HEALTH_THRESHOLD = 30.0

@battery_bp.route('/', methods=['POST'])
def add_battery_data():
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        voltage = data.get('voltage')
        temperature = data.get('temperature')
        cycles = data.get('cycles')
        health = data.get('health')
        
        if not device_id or voltage is None or temperature is None or health is None:
            return jsonify({"message": "Missing required fields"}), 400
            
        new_data = BatteryData(
            device_id=device_id,
            voltage=voltage,
            temperature=temperature,
            cycles=cycles,
            health=health
        )
        db.session.add(new_data)
        
        # Check alerts
        if health < HEALTH_THRESHOLD:
            alert = Alert(device_id=device_id, message=f"Critical Health: {health}%")
            db.session.add(alert)
        if temperature > TEMP_THRESHOLD:
            alert = Alert(device_id=device_id, message=f"High Temperature: {temperature}°C")
            db.session.add(alert)
            
        db.session.commit()
        
        return jsonify({"message": "Battery data added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@battery_bp.route('/<int:device_id>', methods=['GET'])
def get_device_battery_data(device_id):
    try:
        records = BatteryData.query.filter_by(device_id=device_id).order_by(BatteryData.timestamp.desc()).limit(100).all()
        result = []
        for r in records:
            result.append({
                "id": r.id,
                "voltage": r.voltage,
                "temperature": r.temperature,
                "health": r.health,
                "timestamp": r.timestamp.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@battery_bp.route('/check-first-input/<int:device_id>', methods=['GET'])
def check_first_input(device_id):
    try:
        count = BatteryData.query.filter_by(device_id=device_id).count()
        return jsonify({"is_first_input": count == 0}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
