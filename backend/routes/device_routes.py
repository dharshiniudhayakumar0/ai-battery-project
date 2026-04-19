from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Device, BatteryData

device_bp = Blueprint('devices', __name__)

@device_bp.route('/devices', methods=['GET'])
def get_devices():
    try:
        devices = Device.query.all()
        result = []
        for d in devices:
            latest_data = BatteryData.query.filter_by(device_id=d.id).order_by(BatteryData.timestamp.desc()).first()
            status = 'Offline'
            voltage = 0.0
            temp = 0.0
            health = 0.0
            
            if latest_data:
                voltage = latest_data.voltage
                temp = latest_data.temperature
                health = latest_data.health
                if health > 0:
                    if health < 30 or temp > 45:
                        status = 'Critical'
                    elif health < 60 or temp > 40:
                        status = 'Warning'
                    else:
                        status = 'Healthy'
                    
            result.append({
                "id": d.id,
                "name": d.name,
                "type": d.type,
                "env": d.environment, # React expects 'env'
                "environment": d.environment,
                "barcode": d.barcode,
                "voltage": voltage,
                "temp": temp,
                "health": round(health, 1),
                "status": status,
                "created_at": d.created_at.isoformat() if hasattr(d.created_at, 'isoformat') else str(d.created_at) if d.created_at else None
            })
        return jsonify(result), 200
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@device_bp.route('/devices', methods=['POST'])
def create_device():
    try:
        data = request.get_json()
        
        # Check if barcode already exists
        if data.get('barcode'):
            existing = Device.query.filter_by(barcode=data.get('barcode')).first()
            if existing:
                return jsonify({"message": "Device with this barcode already exists"}), 400
                
        new_device = Device(
            name=data.get('name'),
            type=data.get('type'),
            environment=data.get('environment'),
            barcode=data.get('barcode')
        )
        
        db.session.add(new_device)
        db.session.commit()
        
        return jsonify({"message": "Device created successfully", "id": new_device.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@device_bp.route('/devices/<int:id>', methods=['GET'])
def get_device(id):
    try:
        d = Device.query.get(id)
        if not d:
            return jsonify({"message": "Device not found"}), 404
            
        return jsonify({
            "id": d.id,
            "name": d.name,
            "type": d.type,
            "environment": d.environment,
            "barcode": d.barcode,
            "created_at": d.created_at.isoformat()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@device_bp.route('/devices/<int:id>', methods=['PUT'])
def update_device(id):
    try:
        d = Device.query.get(id)
        if not d:
            return jsonify({"message": "Device not found"}), 404
            
        data = request.get_json()
        
        d.name = data.get('name', d.name)
        d.type = data.get('type', d.type)
        d.environment = data.get('environment', d.environment)
        d.barcode = data.get('barcode', d.barcode)
        
        db.session.commit()
        return jsonify({"message": "Device updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@device_bp.route('/devices/<int:id>', methods=['DELETE'])
def delete_device(id):
    try:
        d = Device.query.get(id)
        if not d:
            return jsonify({"message": "Device not found"}), 404
            
        db.session.delete(d)
        db.session.commit()
        
        return jsonify({"message": "Device deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
