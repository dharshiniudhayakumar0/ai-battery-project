import os
from flask import Flask
from flask_mail import Mail, Message
from dotenv import load_dotenv

# Load credentials
load_dotenv('.env')

app = Flask(__name__)
app.config.update(
    MAIL_SERVER=os.environ.get('MAIL_SERVER'),
    MAIL_PORT=int(os.environ.get('MAIL_PORT') or 587),
    MAIL_USE_TLS=os.environ.get('MAIL_USE_TLS') == 'True',
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.environ.get('MAIL_DEFAULT_SENDER')
)

mail = Mail(app)

def test_send():
    with app.app_context():
        try:
            msg = Message(
                "AI Battery - Deployment Test",
                recipients=[os.environ.get('MAIL_USERNAME')],
                body="Testing the real Email OTP integration for your deployment. If you see this, the system is WORKING!"
            )
            mail.send(msg)
            print("[\u2713] Test email sent successfully!")
        except Exception as e:
            print(f"[!] Error: {str(e)}")

if __name__ == "__main__":
    test_send()
