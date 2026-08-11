import os
from datetime import timedelta

class Config:
    """Base configuration"""
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///auth.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    
    # Security
    BCRYPT_LOG_ROUNDS = 12
    
    # CORS
    CORS_HEADERS = 'Content-Type'
    JSON_SORT_KEYS = False
    
    # App
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
