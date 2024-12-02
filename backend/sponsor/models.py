from backend import db
from backend.auth.models import User
import pytz
from datetime import datetime

class Sponsor(db.Model):
    __tablename__ = 'sponsors'  
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(255), nullable=True) 
    industry = db.Column(db.String(100))
    company_url = db.Column(db.String(255), nullable=True)  
    company_logo_blob = db.Column(db.LargeBinary, nullable=True)  
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    approval_status = db.Column(db.String(50), default='pending')
    is_flagged = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('sponsors', uselist=False, lazy=True, cascade='all, delete-orphan'))


class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(pytz.utc).date())
    end_date = db.Column(db.Date, nullable=True)
    budget = db.Column(db.Float, nullable=False)
    visibility = db.Column(db.Enum('public', 'private', name='visibility_types'), default='public')
    goals = db.Column(db.Text, nullable=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsors.id'), nullable=False)
    is_flagged = db.Column(db.Boolean, default=False)
    sponsor = db.relationship('Sponsor', backref=db.backref('campaigns', lazy=True, cascade='all, delete-orphan'))


class AdRequest(db.Model):
    __tablename__ = 'ad_requests'
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    payment_amount = db.Column(db.Float, nullable=True)
    sponsor_message = db.Column(db.Text, nullable=True)
    sponsor_amount = db.Column(db.Float, nullable=True)
    influencer_message = db.Column(db.Text, nullable=True)
    influencer_amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.Enum('pending','under negotiation' ,'accepted', 'rejected', name='status_types'), default='pending')
    requested_by= db.Column(db.Enum('sponsor', 'influencer', name='requester_types'), nullable=False)
    campaign = db.relationship('Campaign', backref=db.backref('ad_requests', lazy=True, cascade='all, delete-orphan'))
    influencer = db.relationship('User', backref=db.backref('ad_requests', lazy=True, cascade='all, delete-orphan'))