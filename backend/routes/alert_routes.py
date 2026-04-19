from flask import Blueprint, jsonify
from database.models import Alert

alert_bp = Blueprint('alerts', __name__)

@alert_bp.route('', methods=['GET'])
def get_alerts():
    try:
        alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(50).all()
        result = []
        for a in alerts:
            result.append({
                "id": a.id,
                "device_id": a.device_id,
                "message": a.message,
                "is_read": a.is_read,
                "timestamp": a.timestamp.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
