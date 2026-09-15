"""
Translator module for UI machine translation.

Provides translation capabilities for multiple languages using various translation services.
"""

import logging
from typing import Optional, List
from googletrans import Translator as GoogleTranslator

logger = logging.getLogger(__name__)


class Translator:
    """
    Main translator class for handling UI translations.
    """
    
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'hi': 'Hindi',
        'ta': 'Tamil',
        'te': 'Telugu',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'bn': 'Bengali',
        'pa': 'Punjabi'
    }
    
    def __init__(self):
        """
        Initialize the translator.
        """
        self.google_translator = GoogleTranslator()
        logger.info(f"Translator initialized with {len(self.SUPPORTED_LANGUAGES)} supported languages")
    
    def translate(self, text: str, target_language: str = 'hi', source_language: str = 'en') -> str:
        """
        Translate text from source to target language.
        
        Args:
            text: Text to translate
            target_language: Target language code (default: 'hi' for Hindi)
            source_language: Source language code (default: 'en' for English)
            
        Returns:
            Translated text
            
        Raises:
            ValueError: If language is not supported
        """
        if target_language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Language '{target_language}' not supported. Supported: {list(self.SUPPORTED_LANGUAGES.keys())}")
        
        if source_language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Language '{source_language}' not supported. Supported: {list(self.SUPPORTED_LANGUAGES.keys())}")
        
        try:
            result = self.google_translator.translate(text, src_lang=source_language, dest_lang=target_language)
            logger.debug(f"Translated '{text}' to '{target_language}': {result['text']}")
            return result['text']
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            raise
    
    def translate_batch(self, texts: List[str], target_language: str = 'hi', source_language: str = 'en') -> List[str]:
        """
        Translate multiple texts.
        
        Args:
            texts: List of texts to translate
            target_language: Target language code
            source_language: Source language code
            
        Returns:
            List of translated texts
        """
        translated_texts = []
        for text in texts:
            try:
                translated = self.translate(text, target_language, source_language)
                translated_texts.append(translated)
            except Exception as e:
                logger.error(f"Batch translation error for '{text}': {str(e)}")
                translated_texts.append(text)  # Return original on error
        
        return translated_texts
    
    def get_supported_languages(self) -> dict:
        """
        Get list of supported languages.
        
        Returns:
            Dictionary of supported languages with codes and names
        """
        return self.SUPPORTED_LANGUAGES.copy()
    
    def detect_language(self, text: str) -> tuple:
        """
        Detect the language of the given text.
        
        Args:
            text: Text to detect language from
            
        Returns:
            Tuple of (language_code, confidence)
        """
        try:
            detection = self.google_translator.detect(text)
            return detection['lang'], detection.get('confidence', 0)
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return 'en', 0  # Default to English on error
