import logging
from flask import Blueprint, request, jsonify
from .models import db, Influencer
from flask_restful import Resource, Api
from backend.auth.models import User, user_datastore, Role
from backend.sponsor.models import Campaign, AdRequest, Sponsor
from flask_security import auth_token_required, hash_password, current_user, roles_required,roles_accepted
import base64

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

influencer_bp = Blueprint('influencer', __name__)
api = Api(influencer_bp)

class InfluencerProfile(Resource):
    @auth_token_required
    @roles_required('influencer')
    def get(self):
        user_id = current_user.id
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404

        return {
            'id': influencer.id,
            'name': influencer.name,
            'category': influencer.category,
            'instagram_url': influencer.instagram_url,
            'twitter_url': influencer.twitter_url,
            'facebook_url': influencer.facebook_url,
            'reach': influencer.reach,
            'picture': base64.b64encode(influencer.picture).decode('utf-8') if influencer.picture else None
        }, 200

    @auth_token_required
    @roles_required('influencer')
    def put(self):
        user_id = current_user.id
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404

        data = request.get_json()
        #logger.info(f"Received data for update: {data}")

        # Update influencer object with new data
        influencer.name = data.get('name', influencer.name)
        influencer.category = data.get('category', influencer.category)
        influencer.instagram_url = data.get('instagramUrl', influencer.instagram_url)
        influencer.twitter_url = data.get('twitterUrl', influencer.twitter_url)
        influencer.facebook_url = data.get('facebookUrl', influencer.facebook_url)
        influencer.reach = data.get('reach', influencer.reach)
        influencer.picture = base64.b64decode(data.get('picture')) if data.get('picture') else influencer.picture

        try:
            db.session.commit()
            logger.info(f"Profile updated for user {user_id}")
            return {"message": "Profile updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile for user {user_id}: {str(e)}")
            return {"message": "Error updating profile"}, 500

class InfluencerRegistration(Resource):
    def post(self):
        data = request.form
        email = data.get('email')
        password = data.get('password')
        category = data.get('category')
        name = data.get('name')
        instagram_url = data.get('instagram_url')
        twitter_url = data.get('twitter_url')
        facebook_url = data.get('facebook_url')
        reach = data.get('reach')
        picture = request.files.get('picture')

        if not email or not password or not category:
            return {"message": "All fields are required"}, 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {"message": "User with this email already exists"}, 400

        user = user_datastore.create_user(email=email, password=hash_password(password))
        influencer_role = Role.query.get(3)  # Assuming 3 is the ID for the influencer role
        user.roles.append(influencer_role)
        db.session.commit()

        if picture:
            picture = picture.read()

        new_influencer = Influencer(
            user_id=user.id,
            name=name,
            category=category,
            instagram_url=instagram_url,
            twitter_url=twitter_url,
            facebook_url=facebook_url,
            reach=reach,
            picture=picture,
        )
        db.session.add(new_influencer)
        db.session.commit()

        return {'message': 'Influencer registered successfully'}, 201


class InfluencerSearchResource(Resource):
    @auth_token_required
    # only sponsors and admin can access this endpoint
    def get(self, id=None):  # Changed from user_id to id
        if id:
            return self.get_influencer(id)
        else:
            return self.get_influencer_list()
    
    def get_influencer(self, id):  # Changed from user_id to id
        influencer = Influencer.query.filter_by(id=id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404

        return {
            'influencer_id': influencer.id,
            'name': influencer.name,
            'category': influencer.category,
            'reach': influencer.reach,
            'instagram_url': influencer.instagram_url,
            'twitter_url': influencer.twitter_url,
            'facebook_url': influencer.facebook_url,
            'picture': base64.b64encode(influencer.picture).decode('utf-8') if influencer.picture else None
        }, 200
    
    def get_influencer_list(self):
        # Get query parameters
        name = request.args.get('name')
        category = request.args.get('category')
        min_reach = request.args.get('min_reach', type=int)
        max_reach = request.args.get('max_reach', type=int)
        is_flagged_str = request.args.get('is_flagged')
        limit = request.args.get('limit', default=10, type=int)

        # Convert is_flagged to boolean
        if is_flagged_str is not None and is_flagged_str != '':
            if is_flagged_str.lower() == 'true':
                is_flagged = True
            elif is_flagged_str.lower() == 'false':
                is_flagged = False
            else:
                return {"message": "Invalid value for is_flagged"}, 400
        else:
            is_flagged = None

        # Build query with optional filters
        query = Influencer.query

        if name:
            query = query.filter(Influencer.name.ilike(f'%{name}%'))
        
        if category:
            query = query.filter(Influencer.category.ilike(f'%{category}%'))
        
        if min_reach is not None:
            query = query.filter(Influencer.reach >= min_reach)
        
        if max_reach is not None:
            query = query.filter(Influencer.reach <= max_reach)
        
        if is_flagged is not None:
            query = query.filter(Influencer.is_flagged == is_flagged)
        
        # Limit the results
        query = query.limit(limit)

        influencers = query.all()

        influencer_list = []
        for influencer in influencers:
            influencer_list.append({
                'id': influencer.id,
                'name': influencer.name,
                'category': influencer.category,
                'reach': influencer.reach,
                'is_flagged': influencer.is_flagged,
            })

        return influencer_list, 200



#influencer dashboard will show the stats like total accepted campaigns, and total accepted ad requests and total sent ad request . proportion of proposed accepted , rejected adrequest. It will also show new adrequests requested by sponsor to the influencer

class InfluencerDashboardResource(Resource):
    @auth_token_required
    @roles_required('influencer')
    def get(self):
        influencer = Influencer.query.filter_by(user_id=current_user.id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404

        # Get total accepted campaigns
        total_campaigns = Campaign.query.join(AdRequest).filter(AdRequest.influencer_id == influencer.id, AdRequest.status == 'accepted').count()

        # Get total accepted ad requests
        total_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id, status='accepted').count()

        # Get total sent ad requests
        total_sent_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id).count()

        # Get proportion of proposed, accepted, and rejected ad requests
        proposed_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id, status='pending').count()
        accepted_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id, status='accepted').count()
        rejected_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id, status='rejected').count()

        # Get new ad requests requested by sponsors
        new_ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id, status='pending', requested_by='sponsor').all()
        new_ad_requests_data = [{
            'id': request.id,
            'campaign_name': request.campaign.name,
            'requested_by': Sponsor.query.filter_by(id=request.campaign.sponsor_id).first().company_name
        } for request in new_ad_requests]

        #ongoing_campaigns 
        ongoing_campaigns = Campaign.query.join(AdRequest).filter(AdRequest.influencer_id == influencer.id, AdRequest.status == 'accepted').all()
        ongoing_campaigns_data = [{
            'id': campaign.id,
            'name': campaign.name,
            'description': campaign.description,
            'start_date': campaign.start_date,
            'end_date': campaign.end_date
        } for campaign in ongoing_campaigns]


        return jsonify({
            'total_campaigns': total_campaigns,
            'total_ad_requests': total_ad_requests,
            'total_sent_ad_requests': total_sent_ad_requests,
            'proposed_ad_requests': proposed_ad_requests,
            'accepted_ad_requests': accepted_ad_requests,
            'rejected_ad_requests': rejected_ad_requests,
            'new_ad_requests': new_ad_requests_data,
            'ongoing_campaigns': ongoing_campaigns_data
        })

#resource influecerAdrequest- to get all adrequests for influencer

class InfluencerAdRequest(Resource):
    @auth_token_required
    @roles_required('influencer')
    def get(self):
        # Get the current influencer
        influencer = Influencer.query.filter_by(user_id=current_user.id).first()
        if not influencer:
            return {"message": "Influencer not found"}, 404

        # Query ad requests for the current influencer
        ad_requests = AdRequest.query.filter_by(influencer_id=influencer.id).all()
        ad_requests_data = []

        for request in ad_requests:
            # Fetch the campaign associated with the ad request
            campaign = Campaign.query.filter_by(id=request.campaign_id).first()
            campaign_name = campaign.name if campaign else 'Unknown'

            ad_requests_data.append({
                'id': request.id,
                'campaign_id': request.campaign_id,
                'campaign_name': campaign_name,
                'requirements': request.requirements,
                'payment_amount': request.payment_amount,
                'sponsor_message': request.sponsor_message,
                'sponsor_amount': request.sponsor_amount,
                'influencer_message': request.influencer_message,
                'influencer_amount': request.influencer_amount,
                'status': request.status,
                'requested_by': request.requested_by,
            })

        return jsonify(ad_requests_data)



api.add_resource(InfluencerProfile, '/profile')
api.add_resource(InfluencerRegistration, '/register')
api.add_resource(InfluencerSearchResource, '/', '/<int:id>')
api.add_resource(InfluencerDashboardResource, '/dashboard')
api.add_resource(InfluencerAdRequest, '/adrequests')
