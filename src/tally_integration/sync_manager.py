"""
Tally Synchronization Manager.

Handles bidirectional synchronization with Tally Prime.
"""

import logging
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


class TallySyncManager:
    """
    Manager for synchronizing data with Tally Prime.
    """
    
    def __init__(self, tally_api_url: str = 'http://localhost:9000', sync_interval: int = 300):
        """
        Initialize Tally Sync Manager.
        
        Args:
            tally_api_url: Tally API endpoint URL
            sync_interval: Sync interval in seconds (default: 5 minutes)
        """
        self.tally_api_url = tally_api_url
        self.sync_interval = sync_interval
        self.session = self._create_session()
        self.last_sync_time = None
        self.sync_success_count = 0
        self.sync_failure_count = 0
        logger.info(f"Tally Sync Manager initialized - API: {tally_api_url}, Interval: {sync_interval}s")
    
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
        return session
    
    def sync_masters(self) -> Dict[str, Any]:
        """
        Sync master data (accounts, cost centers, items) from Tally.
        
        Returns:
            Dictionary containing sync results
        """
        try:
            endpoint = f"{self.tally_api_url}/api/masters"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            self.sync_success_count += 1
            self.last_sync_time = datetime.now()
            
            logger.info(f"Master data sync successful: {response.status_code}")
            return {
                'status': 'success',
                'data': response.json(),
                'timestamp': self.last_sync_time.isoformat()
            }
        except Exception as e:
            self.sync_failure_count += 1
            logger.error(f"Master data sync failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def sync_transactions(self, from_date: str = None, to_date: str = None) -> Dict[str, Any]:
        """
        Sync transaction data from Tally.
        
        Args:
            from_date: Start date for transaction sync (ISO format)
            to_date: End date for transaction sync (ISO format)
            
        Returns:
            Dictionary containing sync results
        """
        try:
            endpoint = f"{self.tally_api_url}/api/transactions"
            params = {}
            if from_date:
                params['from_date'] = from_date
            if to_date:
                params['to_date'] = to_date
            
            response = self.session.get(endpoint, params=params, timeout=15)
            response.raise_for_status()
            
            self.sync_success_count += 1
            self.last_sync_time = datetime.now()
            
            logger.info(f"Transaction data sync successful: {response.status_code}")
            return {
                'status': 'success',
                'data': response.json(),
                'timestamp': self.last_sync_time.isoformat()
            }
        except Exception as e:
            self.sync_failure_count += 1
            logger.error(f"Transaction data sync failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def sync_gst_data(self) -> Dict[str, Any]:
        """
        Sync GST-related data from Tally.
        
        Returns:
            Dictionary containing GST data sync results
        """
        try:
            endpoint = f"{self.tally_api_url}/api/gst"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            self.sync_success_count += 1
            self.last_sync_time = datetime.now()
            
            logger.info(f"GST data sync successful: {response.status_code}")
            return {
                'status': 'success',
                'data': response.json(),
                'timestamp': self.last_sync_time.isoformat()
            }
        except Exception as e:
            self.sync_failure_count += 1
            logger.error(f"GST data sync failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def push_data_to_tally(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Push data to Tally Prime.
        
        Args:
            data: Data to push to Tally
            
        Returns:
            Dictionary containing push results
        """
        try:
            endpoint = f"{self.tally_api_url}/api/data"
            response = self.session.post(endpoint, json=data, timeout=15)
            response.raise_for_status()
            
            self.sync_success_count += 1
            logger.info(f"Data push to Tally successful: {response.status_code}")
            return {
                'status': 'success',
                'response': response.json(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            self.sync_failure_count += 1
            logger.error(f"Data push to Tally failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_sync_status(self) -> Dict[str, Any]:
        """
        Get current sync status and statistics.
        
        Returns:
            Dictionary containing sync status and statistics
        """
        total_syncs = self.sync_success_count + self.sync_failure_count
        success_rate = (self.sync_success_count / total_syncs * 100) if total_syncs > 0 else 0
        
        return {
            'last_sync_time': self.last_sync_time.isoformat() if self.last_sync_time else None,
            'total_syncs': total_syncs,
            'successful_syncs': self.sync_success_count,
            'failed_syncs': self.sync_failure_count,
            'success_rate': round(success_rate, 2),
            'tally_api_url': self.tally_api_url,
            'sync_interval': self.sync_interval
        }
