import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("SMTP_EMAIL")
        self.sender_password = os.getenv("SMTP_PASSWORD")

    def send_friend_request_email(self, to_email: str, sender_name: str = "A friend"):
        """
        Sends a friend request email notification.
        """
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials not found. Skipping email sending.")
            return False

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = f"{sender_name} sent you a friend request on SideQuest!"

            body = f"""
            <html>
              <body>
                <h2>New Friend Request!</h2>
                <p>Hello,</p>
                <p><strong>{sender_name}</strong> wants to be your friend on SideQuest.</p>
                <p>Log in to the app to accept their request and start planning adventures together!</p>
                <br>
                <p>Happy Questing,</p>
                <p>The SideQuest Team</p>
              </body>
            </html>
            """
            msg.attach(MIMEText(body, 'html'))

            # detailed error handling for smtplib
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            text = msg.as_string()
            server.sendmail(self.sender_email, to_email, text)
            server.quit()
            
            logger.info(f"Friend request email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
