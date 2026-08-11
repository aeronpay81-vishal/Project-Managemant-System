from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config import Config
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register error handlers
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)
    
    # Register JWT error handlers
    register_jwt_error_handlers(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app


def register_jwt_error_handlers(app):
    """Register JWT related error handlers"""
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'success': False,
            'message': 'Token has expired'
        }, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'success': False,
            'message': 'Invalid token'
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'success': False,
            'message': 'Authorization header is missing'
        }, 401
