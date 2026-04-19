from flask import Blueprint, request, jsonify

health_calc_bp = Blueprint('health_calc', __name__)

@health_calc_bp.route('/calculate-health', methods=['POST'])
def calculate_health():
    try:
        data = request.get_json()
        battery_type = data.get('battery_type', 'Lead Acid')
        system_type = data.get('system_type', 'UPS')
        years = float(data.get('years', 0))
        cycles = float(data.get('cycles', 0))
        
        avg_voltage = float(data.get('avg_voltage', 12.0))
        avg_temp = float(data.get('avg_temp', 25.0))
        
        # Base health starts at 100%
        health = 100.0
        
        # Years impact (categorized by chemistry families)
        lithium_types = ['Lithium-ion', 'Lithium Polymer (LiPo)', 'LiFePO4', 'Solid State Battery', 'Magnesium-Ion']
        lead_acid_types = ['Lead Acid (Flooded)', 'Lead Acid (AGM)', 'Lead Acid (Gel)']
        nickel_types = ['Nickel-Cadmium (NiCd)', 'Nickel-Metal Hydride (NiMH)', 'Nickel-Zinc (NiZn)']
        flow_types = ['Flow Battery (Vanadium)', 'Flow Battery (Zinc-Bromine)']
        
        year_impact = 5.0 # Default
        if battery_type in lithium_types:
            year_impact = 3.0
        elif battery_type in nickel_types:
            year_impact = 4.0
        elif battery_type in flow_types:
            year_impact = 2.0
            
        health -= (years * year_impact)
        
        # Temperature impact (Arrhenius Equation simplified: higher temp = faster degradation)
        # Optimal temp is 20-30°C. 
        if avg_temp > 30:
            health -= (avg_temp - 30) * 0.5 * years
        elif avg_temp < 10:
            health -= (10 - avg_temp) * 0.2 * years
            
        # Voltage impact (Stress from overcharge or deep discharge)
        # Assuming nominal systems (e.g. 12V system)
        if avg_voltage > 14.2: # Overcharge stress
            health -= (avg_voltage - 14.2) * 2.0
        elif avg_voltage < 11.5: # Deep discharge stress
            health -= (11.5 - avg_voltage) * 3.0
        
        # Cycles impact
        cycle_capacity = 300.0 # Default (Lead Acid)
        if battery_type in lithium_types:
            cycle_capacity = 800.0
        elif battery_type in nickel_types:
            cycle_capacity = 500.0
        elif battery_type in flow_types:
            cycle_capacity = 2000.0
            
        health -= (cycles / cycle_capacity) * 20.0 # 20% of life is cycle-dependent in this simple model
        
        # System usage intensity
        intensity = 1.0
        if system_type == 'EV':
            intensity = 1.5
        elif system_type == 'Industrial':
            intensity = 1.3
        elif system_type == 'Solar Storage':
            intensity = 1.1
            
        health *= (1.0 - (intensity - 1.0) * 0.1)
        
        # Random variance for realism
        import random
        health += random.uniform(-2, 2)
        
        # Bound between 0 and 100
        health = max(5.0, min(100.0, health))
        
        return jsonify({
            "calculated_health": round(health, 2),
            "estimated_remaining_years": round(max(0, (health - 20) / year_impact), 1) if health > 20 else 0
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
