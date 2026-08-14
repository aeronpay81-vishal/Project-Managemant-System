from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

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
    from app.routes.project import project_bp
    from app.routes.task import task_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')

    # Add file serving route for uploads
    @app.route('/uploads/<path:filepath>')
    def serve_uploads(filepath):
        """Serve uploaded files from instance/uploads directory"""
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'instance', 'uploads')
        try:
            return send_from_directory(upload_dir, filepath)
        except Exception as e:
            return {'error': 'File not found'}, 404

    # Import models so SQLAlchemy creates all tables
    from app.models import User, Project, ProjectReport, Task  # noqa: F401

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
            'error': 'invalid_token',
            'message': 'Invalid token. Please provide a valid access token.'
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'success': False,
            'error': 'missing_token',
            'message': 'Authorization header is missing or malformed. Use: Bearer <access_token>'
        }, 401
