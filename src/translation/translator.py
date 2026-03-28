import googletrans
from googletrans import Translator

class TranslationModule:
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = {
            'bn': 'Bengali',
            'te': 'Telugu',
            'mr': 'Marathi',
            'ta': 'Tamil',
            'gu': 'Gujarati',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi',
            'or': 'Odia',
            'as': 'Assamese',
            'ur': 'Urdu',
            'sa': 'Sanskrit',
            'ks': 'Kashmiri',
            'sd': 'Sindhi',
            'ne': 'Nepali',
            'kok': 'Konkani',
            'mni': 'Manipuri',
            'sat': 'Santali',
            'doi': 'Dogri',
            'mai': 'Maithili',
            'zh-cn': 'Chinese (Simplified)',
            'zh-tw': 'Chinese (Traditional)',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'ja': 'Japanese',
            'ko': 'Korean',
            'pt-BR': 'Portuguese (Brazilian)',
            'pt-PT': 'Portuguese (European)',
            'ru': 'Russian',
            'ar': 'Arabic',
            'it': 'Italian',
            'nl': 'Dutch',
            'pl': 'Polish',
            'tr': 'Turkish',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'ms': 'Malay',
            'id': 'Indonesian',
            'sw': 'Swahili',
            'he': 'Hebrew',
            'fa': 'Persian',
            'uk': 'Ukrainian',
            'tl': 'Filipino',
            'cs': 'Czech',
            'el': 'Greek',
            'sv': 'Swedish',
            'da': 'Danish',
            'ro': 'Romanian',
            'fi': 'Finnish',
            'no': 'Norwegian',
            'hu': 'Hungarian',
            'sk': 'Slovak',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sr': 'Serbian',
            'lt': 'Lithuanian',
            'lv': 'Latvian',
            'et': 'Estonian',
            'sl': 'Slovenian',
            'af': 'Afrikaans',
            'am': 'Amharic',
            'az': 'Azerbaijani',
            'eu': 'Basque',
            'be': 'Belarusian',
            'ca': 'Catalan',
            'gl': 'Galician',
            'ka': 'Georgian',
            'is': 'Icelandic',
            'km': 'Khmer',
            'lo': 'Lao',
            'mk': 'Macedonian',
            'mn': 'Mongolian',
            'my': 'Burmese',
            'si': 'Sinhala',
            'zu': 'Zulu',
        }

    def translate_text(self, text, target_language):
        if target_language not in self.supported_languages:
            raise ValueError(f'Language {target_language} is not supported.')
        translated = self.translator.translate(text, dest=target_language)
        return translated.text

    def translate_text_to_multiple_languages(self, text, languages):
        translations = {}
        for lang in languages:
            try:
                translations[lang] = self.translate_text(text, lang)
            except Exception as e:
                translations[lang] = f'Error: {str(e)}'
        return translations

# Example usage:
# if __name__ == '__main__':
#     module = TranslationModule()
#     text_to_translate = 'Hello, World!'
#     languages_to_translate = ['es', 'fr', 'de', 'ja', 'zh-cn']
#     print(module.translate_text_to_multiple_languages(text_to_translate, languages_to_translate))
