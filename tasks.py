from backend.sponsor.models import Sponsor, Campaign, AdRequest
from flask_security import current_user
from flask import jsonify, make_response, current_app
from backend.influencer.models import Influencer
from celery import shared_task
from io import StringIO
import csv
from datetime import datetime 
import flask_excel as excel 
import pandas as pd
from mail_service import send_mail
    
@shared_task(ignore_result=False)
def create_resource_csv(user_id):
    sponsor = Sponsor.query.filter_by(user_id=user_id).first()
    if not sponsor:
        return "Sponsor not found"  

    campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
    if not campaigns:
        return "No campaigns found for this sponsor"

    # Convert to DataFrame with formatted dates
    data = [{
        'name': campaign.name,
        'description': campaign.description,
        'start_date': campaign.start_date.strftime('%Y-%m-%d') if campaign.start_date else '',
        'end_date': campaign.end_date.strftime('%Y-%m-%d') if campaign.end_date else '',
        'budget': campaign.budget,
        'visibility': campaign.visibility,
        'goals': campaign.goals
    } for campaign in campaigns]

    df = pd.DataFrame(data)
    filename = f"campaign_data_{user_id}.csv"
    df.to_csv(filename, index=False)

    return filename

@shared_task(ignore_result=False)
def daily_reminder():
    influencers = Influencer.query.all()
    for influencer in influencers:
        pending_requests = AdRequest.query.filter_by(influencer_id=influencer.id).all()
        if pending_requests:
            # Send reminder via email
            subject = "Reminder: Pending Ad Requests"
            body = "You have pending ad requests. Please review and accept/reject them."
            send_mail(influencer.user.email, subject, body)

@shared_task(ignore_result=False)
def monthly_report():
    sponsors = Sponsor.query.all()
    for sponsor in sponsors:
        # Generate report (replace with your actual report generation logic)
        report_html = f"""
        <h1>Monthly Activity Report for {sponsor.company_name}</h1>
        <p>Date: {datetime.now().strftime('%Y-%m-%d')}</p>
        <p>Number of campaigns: {len(sponsor.campaigns)}</p>
        """
        # Send report via email
        subject = "Monthly Activity Report"
        send_mail(sponsor.user.email, subject, report_html)


