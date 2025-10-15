import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from .config import settings


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    to_name: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        to_name: Optional recipient name

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Skip if email not configured
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print("Email not configured. Skipping email send.")
        return False

    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
        message["To"] = to_email

        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            if settings.MAIL_STARTTLS:
                server.starttls()

            if settings.USE_CREDENTIALS:
                server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)

            server.send_message(message)

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_booking_confirmation_email(
    customer_email: str,
    customer_name: str,
    booking_id: int,
    service_name: str,
    preferred_date: str,
    preferred_time: str,
    address: str,
    problem_description: str
) -> bool:
    """Send booking confirmation email to customer"""

    subject = f"Booking Confirmation - QuickFix #{booking_id}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
            }}
            .booking-details {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .detail-row {{
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }}
            .detail-label {{
                font-weight: bold;
                color: #667eea;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
            }}
            .status-badge {{
                display: inline-block;
                background: #ffc107;
                color: #000;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 QuickFix</h1>
                <h2>Booking Confirmation</h2>
            </div>
            <div class="content">
                <p>Hi {customer_name},</p>
                <p>Thank you for choosing QuickFix! Your service request has been received successfully.</p>

                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span> #{booking_id}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service:</span> {service_name}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span> <span class="status-badge">PENDING</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Preferred Date:</span> {preferred_date}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Preferred Time:</span> {preferred_time}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span> {address}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Problem Description:</span><br>
                        {problem_description}
                    </div>
                </div>

                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our team will review your request</li>
                    <li>A technician will be assigned to your booking</li>
                    <li>You'll receive an email notification when a technician is assigned</li>
                    <li>The technician will contact you to confirm the appointment</li>
                </ul>

                <p>If you have any questions, feel free to contact us.</p>

                <p>Best regards,<br>
                <strong>QuickFix Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 QuickFix - Technician Booking & Dispatch Portal</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(customer_email, subject, html_content, customer_name)


def send_booking_status_update_email(
    customer_email: str,
    customer_name: str,
    booking_id: int,
    new_status: str,
    technician_name: Optional[str] = None,
    technician_phone: Optional[str] = None
) -> bool:
    """Send booking status update email to customer"""

    status_messages = {
        "pending": {
            "title": "Booking Pending",
            "message": "Your booking is currently pending review.",
            "color": "#ffc107",
            "icon": "⏳"
        },
        "accepted": {
            "title": "Booking Accepted",
            "message": "Great news! Your booking has been accepted by a technician.",
            "color": "#17a2b8",
            "icon": "✅"
        },
        "in_progress": {
            "title": "Work In Progress",
            "message": "The technician is currently working on your service request.",
            "color": "#007bff",
            "icon": "🔧"
        },
        "completed": {
            "title": "Service Completed",
            "message": "Your service request has been completed successfully!",
            "color": "#28a745",
            "icon": "🎉"
        },
        "cancelled": {
            "title": "Booking Cancelled",
            "message": "Your booking has been cancelled.",
            "color": "#dc3545",
            "icon": "❌"
        }
    }

    status_info = status_messages.get(new_status, status_messages["pending"])

    subject = f"Booking Update - QuickFix #{booking_id} - {status_info['title']}"

    technician_info = ""
    if technician_name:
        technician_info = f"""
        <div class="technician-info">
            <h3>👨‍🔧 Assigned Technician</h3>
            <p><strong>Name:</strong> {technician_name}</p>
            {f'<p><strong>Phone:</strong> {technician_phone}</p>' if technician_phone else ''}
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
            }}
            .status-box {{
                background: white;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                border-left: 5px solid {status_info['color']};
            }}
            .status-icon {{
                font-size: 48px;
                margin-bottom: 10px;
            }}
            .technician-info {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
            }}
            .status-badge {{
                display: inline-block;
                background: {status_info['color']};
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 16px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 QuickFix</h1>
                <h2>Booking Status Update</h2>
            </div>
            <div class="content">
                <p>Hi {customer_name},</p>

                <div class="status-box">
                    <div class="status-icon">{status_info['icon']}</div>
                    <h2>{status_info['title']}</h2>
                    <p>{status_info['message']}</p>
                    <div style="margin-top: 15px;">
                        <span class="status-badge">{new_status.replace('_', ' ').upper()}</span>
                    </div>
                </div>

                <p><strong>Booking ID:</strong> #{booking_id}</p>

                {technician_info}

                <p>You can track your booking status anytime by logging into your QuickFix account.</p>

                <p>Thank you for choosing QuickFix!</p>

                <p>Best regards,<br>
                <strong>QuickFix Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 QuickFix - Technician Booking & Dispatch Portal</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(customer_email, subject, html_content, customer_name)


def send_technician_assignment_email(
    technician_email: str,
    technician_name: str,
    booking_id: int,
    customer_name: str,
    customer_phone: Optional[str],
    service_name: str,
    preferred_date: str,
    preferred_time: str,
    address: str,
    problem_description: str
) -> bool:
    """Send assignment notification email to technician"""

    subject = f"New Job Assignment - QuickFix #{booking_id}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
            }}
            .job-details {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .detail-row {{
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }}
            .detail-label {{
                font-weight: bold;
                color: #11998e;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 QuickFix</h1>
                <h2>New Job Assignment</h2>
            </div>
            <div class="content">
                <p>Hi {technician_name},</p>
                <p>You have been assigned to a new service request. Please review the details below:</p>

                <div class="job-details">
                    <h3>Job Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span> #{booking_id}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service:</span> {service_name}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Customer:</span> {customer_name}
                    </div>
                    {f'<div class="detail-row"><span class="detail-label">Customer Phone:</span> {customer_phone}</div>' if customer_phone else ''}
                    <div class="detail-row">
                        <span class="detail-label">Scheduled Date:</span> {preferred_date}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Scheduled Time:</span> {preferred_time}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span> {address}
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Problem Description:</span><br>
                        {problem_description}
                    </div>
                </div>

                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Log in to your QuickFix portal to accept or review the assignment</li>
                    <li>Contact the customer to confirm the appointment</li>
                    <li>Update the job status as you progress</li>
                </ul>

                <p>Best regards,<br>
                <strong>QuickFix Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 QuickFix - Technician Booking & Dispatch Portal</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(technician_email, subject, html_content, technician_name)
