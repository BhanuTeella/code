from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import DevelopmentConfig

SMTP_HOST = DevelopmentConfig.SMTP_HOST
SMTP_PORT = DevelopmentConfig.SMTP_PORT
SENDER_EMAIL = DevelopmentConfig.SENDER_EMAIL



def send_mail(to, subject, content_body):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg.attach(MIMEText(content_body, 'html'))
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()
