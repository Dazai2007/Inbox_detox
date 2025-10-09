import smtplib
from email.message import EmailMessage
from typing import Optional
import logging

from app.core.config import settings


def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain text email using SMTP settings from config.

    Returns True on success, False otherwise.
    In development, if SMTP isn't configured, logs the email and returns True.
    """
    logger = logging.getLogger("app")

    # If SMTP not configured, just log and return success (dev mode)
    if not settings.smtp_host or not settings.smtp_from:
        logger.info(f"[DEV-EMAIL] To: {to}\nSubject: {subject}\n\n{body}")
        return True

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)

        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False
