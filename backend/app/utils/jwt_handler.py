from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta


class JWTHandler:
    """Utility class for JWT token operations"""
    
    @staticmethod
    def create_tokens(user_id, expires_in_hours=1):
        """
        Create both access and refresh tokens
        
        Args:
            user_id (int): User ID
            expires_in_hours (int): Access token expiration time
            
        Returns:
            dict: Tokens dictionary
        """
        access_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(hours=expires_in_hours)
        )
        
        refresh_token = create_refresh_token(identity=user_id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def create_access_token_only(user_id, expires_in_hours=1):
        """
        Create only access token
        
        Args:
            user_id (int): User ID
            expires_in_hours (int): Token expiration time
            
        Returns:
            str: Access token
        """
        return create_access_token(
            identity=user_id,
            expires_delta=timedelta(hours=expires_in_hours)
        )
