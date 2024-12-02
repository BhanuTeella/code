import logging
from flask import Blueprint, request, jsonify 
from flask_restful import Resource, Api
from backend import db
from backend.sponsor.models import Sponsor, Campaign, AdRequest
from backend.influencer.models import Influencer
from flask_security import auth_token_required, hash_password, current_user, roles_required
import base64

admin_bp = Blueprint('admin', __name__)
api = Api(admin_bp)

   
#resource for admin to approve or reject sponsor
class sponsorApproval(Resource):
    @auth_token_required
    @roles_required('admin')
    def put(self):
        data=request.get_json()
        id = data.get('id')
        approval_status = data.get('approval_status')

        if not id:
            return {"message": "User ID is required"}, 400
        if not approval_status:
            return {"message": "Approval status is required"}, 400

        sponsor = Sponsor.query.filter_by(id=id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404
        
        sponsor.approval_status = approval_status
        db.session.commit()
        return {"message": "Sponsor approval status updated"}, 200
    
    
    
#resource for admin to flag 
class sponsorFlag(Resource):
    @auth_token_required
    @roles_required('admin')
    def put(self):
        data=request.get_json()
        id = data.get('id')
        is_flagged = data.get('is_flagged')

        if not id:
            return {"message": "ID is required"}, 400

        sponsor = Sponsor.query.filter_by(id=id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404
        
        sponsor.is_flagged = is_flagged
        db.session.commit()
        return {"message": "Sponsor flag status updated"}, 200

# Resource for admin to flag an influencer
class InfluencerFlag(Resource):
    @auth_token_required
    @roles_required('admin')
    def put(self):
        data = request.get_json()
        id = data.get('id')
        is_flagged = data.get('is_flagged')

        if not id:
            return {"message": "ID is required"}, 400

        influencer = Influencer.query.filter_by(id=id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404
        
        influencer.is_flagged = is_flagged
        db.session.commit()
        return {"message": "Influencer flag status updated"}, 200

# Resource for admin to flag a campaign
class CampaignFlag(Resource):
    @auth_token_required
    @roles_required('admin')
    def put(self):
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        is_flagged = data.get('is_flagged')

        if not campaign_id:
            return {"message": "Campaign ID is required"}, 400

        campaign = Campaign.query.filter_by(id=campaign_id).first()
        if not campaign:
            return {"message": "Campaign not found"}, 404
        
        campaign.is_flagged = is_flagged
        db.session.commit()
        return {"message": "Campaign flag status updated"}, 200

#admin dashboard will show the stats like total influencers, sponsors,campaigns, and total ad requests 
class AdminDashboard(Resource):
    @auth_token_required
    @roles_required('admin')
    def get(self):
        influencers = Influencer.query.count()
        sponsors = Sponsor.query.count()
        campaigns = Campaign.query.count()
        ad_requests = AdRequest.query.count()
        return {"influencers": influencers, "sponsors": sponsors, "campaigns": campaigns, "ad_requests": ad_requests}, 200


api.add_resource(sponsorApproval, '/sponsor/approval')
api.add_resource(sponsorFlag, '/sponsor/flag')
api.add_resource(InfluencerFlag, '/influencer/flag')
api.add_resource(CampaignFlag, '/campaign/flag')
api.add_resource(AdminDashboard, '/dashboard')
