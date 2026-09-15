"""
API routes for the Flask application.

Provides endpoints for translation and GST calculations.
"""

from flask import Blueprint, request, jsonify, current_app
import logging

logger = logging.getLogger(__name__)

# Create blueprints for different API sections
translation_bp = Blueprint('translation', __name__, url_prefix='/api/translation')
gst_bp = Blueprint('gst', __name__, url_prefix='/api/gst')
tally_bp = Blueprint('tally', __name__, url_prefix='/api/tally')


@translation_bp.route('/translate', methods=['POST'])
def translate():
    """
    Translate text to target language.
    
    Request JSON:
    {
        "text": "Hello",
        "target_language": "hi",
        "source_language": "en"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text')
        target_language = data.get('target_language', 'hi')
        source_language = data.get('source_language', 'en')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        translator = current_app.translator
        translated_text = translator.translate(text, target_language, source_language)
        
        return jsonify({
            'original': text,
            'translated': translated_text,
            'source_language': source_language,
            'target_language': target_language,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@translation_bp.route('/languages', methods=['GET'])
def get_languages():
    """
    Get list of supported languages.
    """
    try:
        translator = current_app.translator
        languages = translator.get_supported_languages()
        return jsonify({
            'languages': languages,
            'count': len(languages),
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error getting languages: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@gst_bp.route('/calculate', methods=['POST'])
def calculate_gst():
    """
    Calculate GST for given amount.
    
    Request JSON:
    {
        "amount": 1000,
        "gst_rate": 18
    }
    """
    try:
        data = request.get_json()
        amount = float(data.get('amount', 0))
        gst_rate = float(data.get('gst_rate', 18))
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        calculator = current_app.gst_calculator
        base, gst, total = calculator.calculate_total_with_gst(amount, gst_rate)
        
        return jsonify({
            'base_amount': base,
            'gst_rate': gst_rate,
            'gst_amount': gst,
            'total_amount': total,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"GST calculation error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@gst_bp.route('/categories', methods=['GET'])
def get_gst_categories():
    """
    Get list of GST rate categories.
    """
    try:
        calculator = current_app.gst_calculator
        categories = calculator.get_all_categories()
        return jsonify({
            'categories': categories,
            'count': len(categories),
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@tally_bp.route('/sync-status', methods=['GET'])
def get_sync_status():
    """
    Get Tally sync status.
    """
    try:
        if hasattr(current_app, 'tally_sync_manager'):
            status = current_app.tally_sync_manager.get_sync_status()
            return jsonify({'status': 'success', 'data': status})
        else:
            return jsonify({'error': 'Tally integration not enabled', 'status': 'failed'}), 503
    except Exception as e:
        logger.error(f"Error getting sync status: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@tally_bp.route('/sync', methods=['POST'])
def trigger_sync():
    """
    Trigger manual sync with Tally.
    """
    try:
        if not hasattr(current_app, 'tally_sync_manager'):
            return jsonify({'error': 'Tally integration not enabled', 'status': 'failed'}), 503
        
        sync_type = request.get_json().get('sync_type', 'all')
        
        if sync_type == 'masters':
            result = current_app.tally_sync_manager.sync_masters()
        elif sync_type == 'transactions':
            result = current_app.tally_sync_manager.sync_transactions()
        elif sync_type == 'gst':
            result = current_app.tally_sync_manager.sync_gst_data()
        else:
            result = {
                'masters': current_app.tally_sync_manager.sync_masters(),
                'transactions': current_app.tally_sync_manager.sync_transactions(),
                'gst': current_app.tally_sync_manager.sync_gst_data()
            }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error triggering sync: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500
