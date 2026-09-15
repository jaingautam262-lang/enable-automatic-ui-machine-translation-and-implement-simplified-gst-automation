"""
ClearTax API Manager.

Handles integration with ClearTax for GST filing and invoice management.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


class ClearTaxManager:
    """
    Manager for integrating with ClearTax API.
    """
    
    def __init__(self, api_url: str = 'https://api.cleartax.in', api_key: str = ''):
        """
        Initialize ClearTax Manager.
        
        Args:
            api_url: ClearTax API endpoint URL
            api_key: ClearTax API authentication key
        """
        self.api_url = api_url
        self.api_key = api_key
        self.session = self._create_session()
        logger.info(f"ClearTax Manager initialized - API: {api_url}")
    
    def _create_session(self) -> requests.Session:
        """
        Create a requests session with retry strategy.
        
        Returns:
            Configured requests session
        """
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        
        # Add authorization header
        if self.api_key:
            session.headers.update({'Authorization': f'Bearer {self.api_key}'})
        
        return session
    
    def file_gst_return(self, return_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        File GST return on ClearTax.
        
        Args:
            return_data: GST return data to file
            
        Returns:
            Dictionary containing filing results
        """
        try:
            endpoint = f"{self.api_url}/gst/returns/file"
            response = self.session.post(endpoint, json=return_data, timeout=30)
            response.raise_for_status()
            
            logger.info(f"GST return filed successfully: {response.status_code}")
            return {
                'status': 'success',
                'response': response.json(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"GST return filing failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def upload_invoices(self, invoices: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Upload invoices to ClearTax.
        
        Args:
            invoices: List of invoice data
            
        Returns:
            Dictionary containing upload results
        """
        try:
            endpoint = f"{self.api_url}/invoices/upload"
            response = self.session.post(endpoint, json={'invoices': invoices}, timeout=30)
            response.raise_for_status()
            
            logger.info(f"Invoices uploaded successfully: {response.status_code}")
            return {
                'status': 'success',
                'count': len(invoices),
                'response': response.json(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Invoice upload failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_gst_compliance_status(self) -> Dict[str, Any]:
        """
        Get GST compliance status from ClearTax.
        
        Returns:
            Dictionary containing compliance status
        """
        try:
            endpoint = f"{self.api_url}/compliance/status"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Compliance status retrieved: {response.status_code}")
            return {
                'status': 'success',
                'data': response.json(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get compliance status: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_tax_summary(self, period: str) -> Dict[str, Any]:
        """
        Get tax summary for a specific period.
        
        Args:
            period: Period in format 'YYYY-MM' (e.g., '2024-01')
            
        Returns:
            Dictionary containing tax summary
        """
        try:
            endpoint = f"{self.api_url}/tax/summary"
            params = {'period': period}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Tax summary retrieved for {period}: {response.status_code}")
            return {
                'status': 'success',
                'data': response.json(),
                'period': period,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get tax summary: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
