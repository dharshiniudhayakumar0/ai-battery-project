import os
from datetime import datetime, timedelta
from flask_mail import Message
from flask import current_app

def send_alert_email(device_id, device_name, alert_message, target_email=None, target_phone=None):
    """
    Sends real-time email and SMS notifications for a battery alert with throttling.
    Prevents flooding by checking if a similar alert was sent in the last 24 hours.
    """
    from database.models import Alert
    
    # 0. Check Cooldown (Rate Limiting)
    try:
        cooldown_time = datetime.utcnow() - timedelta(hours=24)
        # Check if an alert with this message was already sent for this device in the last 24h
        recent_alert = Alert.query.filter(
            Alert.device_id == device_id,
            Alert.message == alert_message,
            Alert.timestamp > cooldown_time
        ).first()
        
        if recent_alert:
            # We already sent an alert for this today. Save to DB (caller 
            # already did this) but don't send Email/SMS.
            print(f"[THROTTLED] Skipping notification for {device_name}: {alert_message} (Sent recently)")
            return True
    except Exception as e:
        print(f"[!] Cooldown check failed: {str(e)}")
        # If check fails, we proceed with sending to be safe

    # 1. Handle Email
    try:
        recipient = target_email or os.environ.get('MAIL_DEFAULT_SENDER')
        if recipient:
            msg = Message(
                subject=f"ALERT: AI Battery Hazard - {device_name}",
                recipients=[recipient],
                body=f"SECURITY ALERT\n\nDevice: {device_name}\nStatus: {alert_message}\nTimestamp: Now\n\nPlease check the dashboard immediately for details."
            )
            mail = current_app.extensions.get('mail')
            if mail:
                mail.send(msg)
                print(f"[SUCCESS] Alert Email sent to {recipient}")
    except Exception as e:
        print(f"[!] Email Alert failed: {str(e)}")

    # 2. Handle SMS (Twilio)
    try:
        sid = os.environ.get('TWILIO_ACCOUNT_SID')
        token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_phone = os.environ.get('TWILIO_PHONE_NUMBER')
        to_phone = target_phone or os.environ.get('ADMIN_PHONE_NUMBER')

        if sid and token and from_phone and to_phone:
            from twilio.rest import Client
            client = Client(sid, token)
            message = client.messages.create(
                body=f"AI Battery ALERT - {device_name}: {alert_message}. Check dashboard.",
                from_=from_phone,
                to=to_phone
            )
            print(f"[SUCCESS] SMS Alert sent to {to_phone} (SID: {message.sid})")
    except Exception as e:
        print(f"[!] SMS Alert failed: {str(e)}")

    return True
