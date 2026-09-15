"""
Unit tests for the Translator module.
"""

import pytest
from src.translation.translator import Translator


class TestTranslator:
    """
    Test cases for Translator class.
    """
    
    @pytest.fixture
    def translator(self):
        """Create translator instance for testing."""
        return Translator()
    
    def test_translator_initialization(self, translator):
        """Test translator initialization."""
        assert translator is not None
        assert len(translator.SUPPORTED_LANGUAGES) > 0
    
    def test_get_supported_languages(self, translator):
        """Test getting supported languages."""
        languages = translator.get_supported_languages()
        assert isinstance(languages, dict)
        assert 'en' in languages
        assert 'hi' in languages
    
    def test_translate_english_to_hindi(self, translator):
        """Test translation from English to Hindi."""
        text = "Hello"
        translated = translator.translate(text, target_language='hi', source_language='en')
        assert isinstance(translated, str)
        assert len(translated) > 0
        assert translated != text  # Should be different
    
    def test_unsupported_language_raises_error(self, translator):
        """Test that unsupported language raises ValueError."""
        with pytest.raises(ValueError):
            translator.translate("Hello", target_language='xx')
    
    def test_translate_batch(self, translator):
        """Test batch translation."""
        texts = ["Hello", "Goodbye", "Thank you"]
        translated = translator.translate_batch(texts, target_language='hi')
        assert isinstance(translated, list)
        assert len(translated) == len(texts)
