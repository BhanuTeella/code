from flask import Blueprint, request, jsonify, current_app, make_response
from .models import db, Sponsor, Campaign, AdRequest
from backend.influencer.models import Influencer
from flask_restful import Resource, Api
from backend.auth.models import User, user_datastore, Role
from flask_security import auth_token_required, hash_password, current_user, roles_required, roles_accepted
import base64
import logging
from datetime import datetime
from celery.result import AsyncResult
from flask import send_file
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sponsor_bp = Blueprint('sponsor', __name__)
api = Api(sponsor_bp)

class SponsorProfileResource(Resource):
    @auth_token_required
    @roles_required('sponsor')
    def get(self):
        user_id = current_user.id
        sponsor = Sponsor.query.filter_by(user_id=user_id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        return {
            'company_name': sponsor.company_name,
            'industry': sponsor.industry,
            'company_url': sponsor.company_url,
            'approval_status': sponsor.approval_status,
            'company_logo_blob': base64.b64encode(sponsor.company_logo_blob).decode('utf-8') if sponsor.company_logo_blob else None
        }, 200

    @auth_token_required
    @roles_required('sponsor')
    def put(self):
        user_id = current_user.id
        sponsor = Sponsor.query.filter_by(user_id=user_id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        data = request.get_json()

        sponsor.company_name = data.get('companyName', sponsor.company_name)
        sponsor.industry = data.get('industry', sponsor.industry)
        sponsor.company_url = data.get('companyUrl', sponsor.company_url)
        sponsor.company_logo_blob = base64.b64decode(data.get('company_logo_blob')) if data.get('company_logo_blob') else sponsor.company_logo_blob

        try:
            db.session.commit()
            logger.info(f"Profile updated for user {user_id}")
            return {"message": "Profile updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile for user {user_id}: {str(e)}")
            return {"message": "Error updating profile"}, 500

    def post(self):
        email = request.form.get('email')
        password = request.form.get('password')
        industry = request.form.get('industry')
        company_name = request.form.get('company_name')
        company_url = request.form.get('company_url')
        company_logo_blob = request.files.get('company_logo_blob')

        if not email or not password or not industry:
            return {"message": "All fields are required"}, 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {"message": "User with this email already exists"}, 400

        user = user_datastore.create_user(email=email, password=hash_password(password))
        sponsor_role = Role.query.get(2)  # Assuming 'sponsor' role ID is 2
        user.roles.append(sponsor_role)
        db.session.commit()

        if company_logo_blob:
            company_logo_blob = company_logo_blob.read()

        sponsor = Sponsor(
            user_id=user.id,
            industry=industry,
            company_name=company_name,
            company_url=company_url,
            company_logo_blob=company_logo_blob,
            approval_status='pending',
        )
        db.session.add(sponsor)
        db.session.commit()

        return {'message': 'Sponsor registered successfully'}, 201

class SponsorSearchResource(Resource):
    @auth_token_required
    def get(self, id=None):
        if id:
            return self.get_sponsor(id)
        else:
            return self.get_sponsor_list()

    def get_sponsor(self, id):
        sponsor = Sponsor.query.filter_by(id=id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        return {
            'company_name': sponsor.company_name,
            'industry': sponsor.industry,
            'company_url': sponsor.company_url,
            'approval_status': sponsor.approval_status,
            'company_logo_blob': base64.b64encode(sponsor.company_logo_blob).decode('utf-8') if sponsor.company_logo_blob else None
        }, 200

    @roles_required('admin')
    def get_sponsor_list(self):
        # Get query parameters
        industry = request.args.get('industry')
        approval_status = request.args.get('approval_status')
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
        query = Sponsor.query

        if industry:
            query = query.filter(Sponsor.industry.ilike(f'%{industry}%'))
        
        if approval_status:
            query = query.filter(Sponsor.approval_status.ilike(f'%{approval_status}%'))
        
        if is_flagged is not None:
            query = query.filter(Sponsor.is_flagged == is_flagged)

        # Limit the results
        query = query.limit(limit)

        sponsors = query.all()

        sponsor_list = []
        for sponsor in sponsors:
            sponsor_list.append({
                'company_name': sponsor.company_name,
                'industry': sponsor.industry,
                'company_url': sponsor.company_url,
                'approval_status': sponsor.approval_status,
                'company_logo_blob': base64.b64encode(sponsor.company_logo_blob).decode('utf-8') if sponsor.company_logo_blob else None,
                'is_flagged': sponsor.is_flagged,
                'id': sponsor.id
            })

        return sponsor_list, 200
  

class SponsorCampaignResource(Resource):
    @auth_token_required
    @roles_required('sponsor')
    def post(self):
        sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        if sponsor.approval_status != 'approved' or sponsor.is_flagged:
            return {"message": "Only approved and not flagged sponsors can create campaigns"}, 403

        data = request.get_json()

        name = data.get('name')
        description = data.get('description')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        budget = data.get('budget')
        visibility = data.get('visibility')
        goals = data.get('goals')

        if not name or not start_date_str or not budget:
            return {"message": "Name, start date, and budget are required"}, 400

        # Convert string dates to datetime.date objects
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
        except ValueError:
            return {"message": "Invalid date format. Please use YYYY-MM-DD."}, 400
        
        #validation to check if start date is before end date
        if end_date and start_date > end_date:
            return {"message": "Start date must be before end date"}, 400

        campaign = Campaign(
            name=name,
            description=description,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            visibility=visibility,
            goals=goals,
            sponsor_id=sponsor.id
        )
        db.session.add(campaign)
        db.session.commit()

        return {'message': 'Campaign created successfully'}, 201

    @auth_token_required
    @roles_required('sponsor')
    def get(self, campaign_id=None):
        sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        if campaign_id:
            campaign = Campaign.query.filter_by(id=campaign_id, sponsor_id=sponsor.id).first()
            if not campaign:
                return {"message": "Campaign not found"}, 404
            return jsonify({
                'id': campaign.id,
                'name': campaign.name,
                'description': campaign.description,
                'start_date': campaign.start_date.strftime('%Y-%m-%d'),
                'end_date': campaign.end_date.strftime('%Y-%m-%d'),
                'budget': campaign.budget,
                'visibility': campaign.visibility,
                'goals': campaign.goals,
                'sponsor_id': campaign.sponsor_id
            })
        else:
            campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
            return jsonify([{
                'id': campaign.id,
                'name': campaign.name,
                'description': campaign.description,
                'start_date': campaign.start_date.strftime('%Y-%m-%d'),
                'end_date': campaign.end_date.strftime('%Y-%m-%d'),
                'budget': campaign.budget,
                'visibility': campaign.visibility,
                'goals': campaign.goals,
                'sponsor_id': campaign.sponsor_id
            } for campaign in campaigns])
    @auth_token_required
    @roles_required('sponsor')
    def put(self, campaign_id):
        data = request.get_json()

        name = data.get('name')
        description = data.get('description')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        budget = data.get('budget')
        visibility = data.get('visibility')
        goals = data.get('goals')

        sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        campaign = Campaign.query.filter_by(id=campaign_id, sponsor_id=sponsor.id).first()
        if not campaign:
            return {"message": "Campaign not found"}, 404

        if name:
            campaign.name = name
        if description:
            campaign.description = description
        if start_date_str:
            try:
                campaign.start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return {"message": "Invalid start date format. Please use YYYY-MM-DD."}, 400
        if end_date_str:
            try:
                campaign.end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return {"message": "Invalid end date format. Please use YYYY-MM-DD."}, 400
        if budget:
            campaign.budget = budget
        if visibility:
            campaign.visibility = visibility
        if goals:
            campaign.goals = goals

        db.session.commit()

        return {'message': 'Campaign updated successfully'}, 200
    
    @auth_token_required
    @roles_required('sponsor')
    def delete(self, campaign_id):
        sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        campaign = Campaign.query.filter_by(id=campaign_id, sponsor_id=sponsor.id).first()
        if not campaign:
            return {"message": "Campaign not found"}, 404

        db.session.delete(campaign)
        db.session.commit()

        return {'message': 'Campaign deleted successfully'}, 200

class CampaignSearchResource(Resource):
    @auth_token_required
    def get(self, campaign_id=None):
        #get user role
        user_role = current_user.roles[0].name

        if campaign_id:
            return self.get_campaign(campaign_id, user_role)
        else:
            return self.get_campaign_list(user_role)

    def get_campaign(self, campaign_id, user_role):
        campaign = Campaign.query.filter_by(id=campaign_id).first()
        if not campaign:
            return {"message": "Campaign not found"}, 404

        return {
            'name': campaign.name,
            'description': campaign.description,
            'start_date': campaign.start_date.isoformat(),
            'end_date': campaign.end_date.isoformat() if campaign.end_date else None,
            'budget': campaign.budget,
            'visibility': campaign.visibility,
            'goals': campaign.goals,
            'sponsor_id': campaign.sponsor_id,
            'is_flagged': campaign.is_flagged
        }, 200

    def get_campaign_list(self, user_role):
        # Applying filters
        sponsor_id = request.args.get('sponsor_id')
        name = request.args.get('name')
        is_flagged_str = request.args.get('is_flagged')
        min_budget = request.args.get('min_budget', type=float)
        max_budget = request.args.get('max_budget', type=float)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

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
        query = Campaign.query

        if sponsor_id:
            query = query.filter_by(sponsor_id=sponsor_id)
        if name:
            query = query.filter(Campaign.name.ilike(f'%{name}%'))
        if is_flagged is not None:
            query = query.filter_by(is_flagged=is_flagged)
        if min_budget is not None:
            query = query.filter(Campaign.budget >= min_budget)
        if max_budget is not None:
            query = query.filter(Campaign.budget <= max_budget)
        if start_date:
            query = query.filter(Campaign.start_date >= start_date)
        if end_date:
            query = query.filter(Campaign.end_date <= end_date)

        # Restrict query to public campaigns for influencers
        if user_role == 'influencer':
            query = query.filter_by(visibility='public')

        campaigns = query.all()

        # Build response list
        campaign_list = []
        for campaign in campaigns:
            campaign_list.append({
                'id': campaign.id,
                'name': campaign.name,
                'description': campaign.description,
                'start_date': campaign.start_date.isoformat(),
                'end_date': campaign.end_date.isoformat() if campaign.end_date else None,
                'budget': campaign.budget,
                'visibility': campaign.visibility,
                'goals': campaign.goals,
                'sponsor_id': campaign.sponsor_id,
                'is_flagged': campaign.is_flagged
            })

        return campaign_list, 200


class AdRequestResource(Resource):
    @auth_token_required
    @roles_accepted('sponsor', 'influencer')
    def post(self):
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        influencer_id = data.get('influencer_id')

        if not campaign_id or not influencer_id:
            return {"message": "Campaign ID and influencer ID are required"}, 400

        if 'sponsor' in [role.name for role in current_user.roles]:
            sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
            if not sponsor:
                return {"message": "Sponsor not found"}, 404

            campaign = Campaign.query.filter_by(id=campaign_id, sponsor_id=sponsor.id).first()
            if not campaign:
                return {"message": "Campaign not found"}, 404

            # Only allow changes to common and sponsor-related fields
            ad_request = AdRequest(
                campaign_id=campaign_id,
                influencer_id=influencer_id,
                requirements=data.get('requirements'),
                sponsor_message=data.get('sponsor_message'),
                sponsor_amount=data.get('sponsor_amount'),
                status='pending',  # Default status
                requested_by='sponsor'
            )

        elif 'influencer' in [role.name for role in current_user.roles]:
            influencer = Influencer.query.filter_by(user_id=current_user.id).first()
            if not influencer:
                return {"message": "Influencer not found"}, 404

            campaign = Campaign.query.filter_by(id=campaign_id).first()
            if not campaign:
                return {"message": "Campaign not found"}, 404

            # Only allow changes to common and influencer-related fields
            ad_request = AdRequest(
                campaign_id=campaign_id,
                influencer_id=influencer.id,
                requirements=data.get('requirements'),
                influencer_message=data.get('influencer_message'),
                influencer_amount=data.get('influencer_amount'),
                status='pending',  # Default status
                requested_by='influencer'
            )

        else:
            return {"message": "User role not authorized to create an ad request"}, 403

        db.session.add(ad_request)
        db.session.commit()

        return {'message': 'Ad request created successfully'}, 201

    @auth_token_required
    def get(self, ad_request_id=None, campaign_id=None, influencer_id=None, sponsor_id=None):
        query = AdRequest.query

        if ad_request_id:
            ad_request = query.filter_by(id=ad_request_id).first()
            if not ad_request:
                return {"message": "Ad request not found"}, 404
            # Fetch the campaign name
            campaign = Campaign.query.filter_by(id=ad_request.campaign_id).first()
            campaign_name = campaign.name if campaign else 'Unknown'
            return jsonify({
                'id': ad_request.id,
                'campaign_id': ad_request.campaign_id,
                'campaign_name': campaign_name,
                'influencer_id': ad_request.influencer_id,
                'requirements': ad_request.requirements,
                'sponsor_message': ad_request.sponsor_message,
                'sponsor_amount': ad_request.sponsor_amount,
                'influencer_message': ad_request.influencer_message,
                'influencer_amount': ad_request.influencer_amount,
                'status': ad_request.status,
                'requested_by': ad_request.requested_by
            })

        if campaign_id:
            ad_requests = query.filter_by(campaign_id=campaign_id).all()
        elif influencer_id:
            ad_requests = query.filter_by(influencer_id=influencer_id).all()
        elif sponsor_id:
            campaign_ids = [campaign.id for campaign in Campaign.query.filter_by(sponsor_id=sponsor_id).all()]
            ad_requests = query.filter(AdRequest.campaign_id.in_(campaign_ids)).all()
        else:
            ad_requests = query.all()

        # Fetch campaign names for the ad requests
        ad_requests_with_campaign_names = []
        for ad_request in ad_requests:
            campaign = Campaign.query.filter_by(id=ad_request.campaign_id).first()
            campaign_name = campaign.name if campaign else 'Unknown'
            ad_requests_with_campaign_names.append({
                'id': ad_request.id,
                'campaign_id': ad_request.campaign_id,
                'campaign_name': campaign_name,
                'influencer_id': ad_request.influencer_id,
                'requirements': ad_request.requirements,
                'sponsor_message': ad_request.sponsor_message,
                'sponsor_amount': ad_request.sponsor_amount,
                'influencer_message': ad_request.influencer_message,
                'influencer_amount': ad_request.influencer_amount,
                'status': ad_request.status,
                'requested_by': ad_request.requested_by,
                'payment_amount': ad_request.payment_amount
            })

        return jsonify(ad_requests_with_campaign_names)
    
    @auth_token_required
    @roles_accepted('sponsor', 'influencer')
    def put(self, ad_request_id):
        ad_request = AdRequest.query.filter_by(id=ad_request_id).first()
        if not ad_request:
            return {"message": "Ad request not found"}, 404

        if ad_request.status == 'accepted':
            return {"message": "This ad request has been accepted and cannot be modified"}, 403

        data = request.get_json()

        if 'sponsor' in [role.name for role in current_user.roles]:
            sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
            if not sponsor:
                return {"message": "Sponsor not found"}, 404

            campaign = Campaign.query.filter_by(id=ad_request.campaign_id, sponsor_id=sponsor.id).first()
            if not campaign:
                return {"message": "You are not authorized to update this ad request"}, 403

            # Only allow updates to sponsor-related fields
            ad_request.requirements = data.get('requirements', ad_request.requirements)
            ad_request.sponsor_message = data.get('sponsor_message', ad_request.sponsor_message)
            ad_request.sponsor_amount = data.get('sponsor_amount', ad_request.sponsor_amount)

            # Update status to 'under negotiation' if the influencer requested it
            if ad_request.requested_by == 'influencer':
                ad_request.status = 'under negotiation'

        elif 'influencer' in [role.name for role in current_user.roles]:
            influencer = Influencer.query.filter_by(user_id=current_user.id).first()
            if not influencer or ad_request.influencer_id != influencer.id:
                return {"message": "You are not authorized to update this ad request"}, 403

            # Only allow updates to influencer-related fields
            ad_request.influencer_message = data.get('influencer_message', ad_request.influencer_message)
            ad_request.influencer_amount = data.get('influencer_amount', ad_request.influencer_amount)

            # Update status to 'under negotiation' if the sponsor requested it
            if ad_request.requested_by == 'sponsor':
                ad_request.status = 'under negotiation'

        else:
            return {"message": "User role not authorized to update an ad request"}, 403

        db.session.commit()

        return {'message': 'Ad request updated successfully'}, 200

class AcceptAdRequestResource(Resource):
    @auth_token_required
    @roles_accepted('sponsor', 'influencer')
    def post(self, ad_request_id):
        ad_request = AdRequest.query.filter_by(id=ad_request_id).first()
        if not ad_request:
            return {"message": "Ad request not found"}, 404

        data = request.get_json()
        action = data.get('action')

        if action not in ['accept', 'reject']:
            return {"message": "Invalid action"}, 400

        # Check if the current user is the sponsor or influencer associated with the request
        if 'sponsor' in [role.name for role in current_user.roles]:
            sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
            if not sponsor or ad_request.campaign.sponsor_id != sponsor.id:
                return {"message": "You are not authorized to perform this action"}, 403

            if action == 'accept':
                ad_request.payment_amount = ad_request.influencer_amount
                ad_request.status = 'accepted'
            elif action == 'reject':
                ad_request.status = 'rejected'

        elif 'influencer' in [role.name for role in current_user.roles]:
            influencer = Influencer.query.filter_by(user_id=current_user.id).first()
            if not influencer or ad_request.influencer_id != influencer.id:
                return {"message": "You are not authorized to perform this action"}, 403

            if action == 'accept':
                ad_request.payment_amount = ad_request.sponsor_amount
                ad_request.status = 'accepted'
            elif action == 'reject':
                ad_request.status = 'rejected'

        db.session.commit()

        return {'message': f'Ad request {action}ed successfully'}, 200


class SponsorDashboardResource(Resource):
    @auth_token_required
    @roles_required('sponsor')
    def get(self):
        sponsor = Sponsor.query.filter_by(user_id=current_user.id).first()
        if not sponsor:
            return {"message": "Sponsor not found"}, 404

        # Get total campaigns
        total_campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).count()

        # Get total ad requests
        total_ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == sponsor.id).count()

        # Get proportion of proposed, accepted, and rejected ad requests
        proposed_ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == sponsor.id, AdRequest.status == 'pending').count()
        accepted_ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == sponsor.id, AdRequest.status == 'accepted').count()
        rejected_ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == sponsor.id, AdRequest.status == 'rejected').count()

        # Get ongoing campaigns
        ongoing_campaigns = Campaign.query.filter(Campaign.sponsor_id == sponsor.id, Campaign.end_date >= datetime.now().date()).all()
        ongoing_campaigns_data = [{
            'id': campaign.id,
            'name': campaign.name,
            'start_date': campaign.start_date,
            'end_date': campaign.end_date
        } for campaign in ongoing_campaigns]

        # Get new ad requests requested by influencers
        new_ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == sponsor.id, AdRequest.status == 'pending', AdRequest.requested_by == 'influencer').all()
        new_ad_requests_data = [{
            'id': request.id,
            'campaign_name': request.campaign.name,
            #influencer name is in influencer table so we need to join it with influencer table
            'requested_by': Influencer.query.filter_by(id=request.influencer_id).first().name,
            #
        } for request in new_ad_requests]


        return jsonify({
            'total_campaigns': total_campaigns,
            'total_ad_requests': total_ad_requests,
            'proposed_campaigns': proposed_ad_requests,
            'accepted_campaigns': accepted_ad_requests,
            'rejected_campaigns': rejected_ad_requests,
            'ongoing_campaigns': ongoing_campaigns_data,
            'new_ad_requests': new_ad_requests_data
        })  


class CreateCSVExportTask(Resource):
    @auth_token_required
    @roles_required('sponsor')
    def get(self):
        from tasks import create_resource_csv
        task = create_resource_csv.delay(current_user.id)
        return jsonify({"task-id": task.id})


class GetCSVExportTask(Resource):
    @auth_token_required
    @roles_required('sponsor')
    def get(self, task_id):
        res = AsyncResult(task_id)
        if res.ready():
            filename = res.result
            #find the file at root directory
            file_path = os.path.join(os.getcwd(), filename)

            # Return the file as a download
            response = make_response(send_file(file_path))
            response.headers['Content-Disposition'] = f'attachment; filename={filename}'
            return response
        else:
            return {"message": "Task is not ready yet"}, 202




api.add_resource(SponsorProfileResource, '/profile')
api.add_resource(SponsorSearchResource, '/', '/<int:id>')
api.add_resource(SponsorCampaignResource, '/campaigns', '/campaigns/<int:campaign_id>')
api.add_resource(CampaignSearchResource, '/campaignsearch', '/campaignsearch/<int:campaign_id>')
api.add_resource(AdRequestResource,'/adrequests', '/adrequests/<int:ad_request_id>', '/adrequests/campaign/<int:campaign_id>', '/adrequests/influencer/<int:influencer_id>', '/adrequests/sponsor/<int:sponsor_id>')
api.add_resource(AcceptAdRequestResource, '/adrequests/<int:ad_request_id>/accept')
api.add_resource(SponsorDashboardResource, '/dashboard')
api.add_resource(CreateCSVExportTask, '/export_campaign_data_csv')
api.add_resource(GetCSVExportTask, '/export_campaign_data_csv/<task_id>')




