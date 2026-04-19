from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        voltage = float(data.get('voltage', 0))
        temperature = float(data.get('temperature', 0))
        
        # Simple rule-based logic (no heavy ML) as requested
        predicted_health = 100.0
        anomaly_status = False
        
        if temperature > 45:
            predicted_health -= (temperature - 45) * 2
            anomaly_status = True
            
        if voltage < 11.0:
            predicted_health -= (11.0 - voltage) * 10
            anomaly_status = True
        elif voltage > 14.5:
            predicted_health -= (voltage - 14.5) * 5
            anomaly_status = True
            
        # Bound between 0 and 100
        predicted_health = max(0.0, min(100.0, predicted_health))
        
        return jsonify({
            "predicted_health": round(predicted_health, 2),
            "anomaly_status": anomaly_status
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
