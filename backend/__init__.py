from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, hash_password
from config import DevelopmentConfig

# Database
db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='../frontend/static', template_folder='../frontend/templates')
    app.config.from_object(DevelopmentConfig)

    # Initialize extensions
    db.init_app(app)

    # Setup Flask-Security
    from .auth.models import user_datastore, Role, User
    security = Security(app, user_datastore)

    # Create database and tables
    with app.app_context():
        db.create_all()

        # Create roles if they don't exist
        if not Role.query.filter_by(name='admin').first():
            admin_role = Role(name='admin', description='Administrator')
            db.session.add(admin_role)
        if not Role.query.filter_by(name='sponsor').first():
            sponsor_role = Role(name='sponsor', description='Sponsor')
            db.session.add(sponsor_role)
        if not Role.query.filter_by(name='influencer').first():
            influencer_role = Role(name='influencer', description='Influencer')
            db.session.add(influencer_role)
        db.session.commit()

        # Create admin user if it doesn't exist
        if not User.query.filter_by(email='admin@example.com').first():
            admin_role = Role.query.filter_by(name='admin').first()
            admin_user = user_datastore.create_user(email='admin@example.com', password=hash_password("adminpass"),
                                                    roles=[admin_role])
            db.session.commit()

    # Register Blueprints
    from backend.auth.views import auth_bp
    from backend.sponsor.views import sponsor_bp
    from backend.influencer.views import influencer_bp
    from backend.admin.views import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sponsor_bp, url_prefix='/api/sponsor')
    app.register_blueprint(influencer_bp, url_prefix='/api/influencer')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Home route
    @app.route('/')
    def home():
        return render_template('index.html')

    return app
