import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
    if not DATABASE_URL:
        raise RuntimeError('DATABASE_URL environment variable is required')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration - CRITICAL FOR TOKEN VALIDATION
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    
    # JWT Token Location - Must match where you send token
    JWT_TOKEN_LOCATION = ['headers']  # Token in Authorization header
    JWT_HEADER_NAME = 'Authorization'  # Header name
    JWT_HEADER_TYPE = 'Bearer'  # Format: "Bearer <token>"
    
    # JWT Error Messages
    JWT_ERROR_MESSAGE_KEY = 'message'
    
    # Security
    BCRYPT_LOG_ROUNDS = 12
    
    # CORS
    CORS_HEADERS = 'Content-Type'
    JSON_SORT_KEYS = False
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'txt', 'zip', 'rar'}
    
    # Create uploads directory
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'projects'), exist_ok=True)
    
    # App
    DEBUG = os.getenv('DEBUG', 'False') == 'True'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-secret-key-fixed'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}