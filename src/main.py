#!/usr/bin/env python3
"""
Main entry point for the UI Machine Translation and GST Automation application.

This script initializes and runs the application.
"""

import sys
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.translation.translator import Translator
from src.gst_automation.calculator import GSTCalculator
from src.config import Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """
    Main application entry point.
    """
    try:
        logger.info("Starting UI Machine Translation and GST Automation Application")
        
        # Initialize configuration
        config = Config()
        logger.info(f"Configuration loaded: {config.get_config()}")
        
        # Initialize translator
        translator = Translator()
        logger.info("Translator initialized")
        
        # Initialize GST calculator
        gst_calculator = GSTCalculator()
        logger.info("GST Calculator initialized")
        
        # Example usage
        logger.info("Application ready for use")
        
        # Sample: Translate a string
        text = "Welcome to GST Automation"
        translated = translator.translate(text, target_language='hi')
        logger.info(f"Translation example - Original: {text} -> Translated: {translated}")
        
        # Sample: Calculate GST
        amount = 1000
        gst_rate = 18
        gst_amount = gst_calculator.calculate_gst(amount, gst_rate)
        logger.info(f"GST Calculation - Amount: {amount}, Rate: {gst_rate}%, GST: {gst_amount}")
        
        logger.info("Application completed successfully")
        
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
