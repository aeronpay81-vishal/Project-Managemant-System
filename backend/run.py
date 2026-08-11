import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

app = create_app()

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV', 'development') == 'development'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.run(
        host=host,
        port=port,
        debug=debug_mode
    )
