"""
Configuration module for the application.

Handles environment variables and application settings.
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """
    Configuration class to manage application settings.
    """
    
    # Translation settings
    DEFAULT_LANGUAGE = os.getenv('DEFAULT_LANGUAGE', 'en')
    SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa']
    
    # GST settings
    DEFAULT_GST_RATE = float(os.getenv('DEFAULT_GST_RATE', 18.0))
    GST_RATES = {
        'electronics': 18.0,
        'services': 18.0,
        'food': 5.0,
        'medicines': 5.0,
        'luxury': 28.0
    }
    
    # Tally Integration settings
    TALLY_ENABLED = os.getenv('TALLY_ENABLED', 'false').lower() == 'true'
    TALLY_API_URL = os.getenv('TALLY_API_URL', 'http://localhost:9000')
    TALLY_SYNC_INTERVAL = int(os.getenv('TALLY_SYNC_INTERVAL', 300))  # 5 minutes
    
    # ClearTax Integration settings
    CLEARTAX_ENABLED = os.getenv('CLEARTAX_ENABLED', 'false').lower() == 'true'
    CLEARTAX_API_URL = os.getenv('CLEARTAX_API_URL', 'https://api.cleartax.in')
    CLEARTAX_API_KEY = os.getenv('CLEARTAX_API_KEY', '')
    
    # Application settings
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """
        Get all configuration as a dictionary.
        
        Returns:
            Dictionary containing all configuration settings.
        """
        return {
            'default_language': cls.DEFAULT_LANGUAGE,
            'supported_languages': cls.SUPPORTED_LANGUAGES,
            'default_gst_rate': cls.DEFAULT_GST_RATE,
            'gst_rates': cls.GST_RATES,
            'tally_enabled': cls.TALLY_ENABLED,
            'tally_api_url': cls.TALLY_API_URL,
            'cleartax_enabled': cls.CLEARTAX_ENABLED,
            'cleartax_api_url': cls.CLEARTAX_API_URL,
            'debug': cls.DEBUG,
            'log_level': cls.LOG_LEVEL,
            'port': cls.PORT,
            'host': cls.HOST
        }
