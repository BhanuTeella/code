from backend import db
from backend.auth.models import User

class Influencer(db.Model):
    __tablename__ = 'influencers'  
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True) 
    category = db.Column(db.String(100))
    instagram_url = db.Column(db.String(255), nullable=True)  
    twitter_url = db.Column(db.String(255), nullable=True)
    facebook_url = db.Column(db.String(255), nullable=True)
    reach = db.Column(db.Integer, nullable=True) #max followers on any platform
    picture = db.Column(db.LargeBinary, nullable=True)  
    is_flagged = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)  
    user = db.relationship('User', backref=db.backref('influencers', uselist=False, lazy=True, cascade='all, delete-orphan'))