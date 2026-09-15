"""
GST Calculator module for automatic GST calculations.

Handles GST calculations, rate management, and financial computations.
"""

import logging
from typing import Dict, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP

logger = logging.getLogger(__name__)


class GSTCalculator:
    """
    GST Calculator for handling GST-related calculations.
    """
    
    # Standard GST rates in India
    STANDARD_GST_RATES = {
        'electronics': 18.0,
        'services': 18.0,
        'food': 5.0,
        'medicines': 5.0,
        'luxury': 28.0,
        'essentials': 0.0  # 0% GST
    }
    
    # IGST, CGST, SGST rates (Inter-state, Central, State)
    COMPONENT_RATES = {
        'igst': {'rate': 18.0, 'type': 'inter_state'},  # IGST = 18%
        'cgst': {'rate': 9.0, 'type': 'central'},       # CGST = 9% (half of 18%)
        'sgst': {'rate': 9.0, 'type': 'state'}          # SGST = 9% (half of 18%)
    }
    
    def __init__(self):
        """
        Initialize the GST Calculator.
        """
        logger.info("GST Calculator initialized")
    
    def calculate_gst(self, amount: float, gst_rate: float) -> float:
        """
        Calculate GST amount for a given amount and rate.
        
        Args:
            amount: Base amount for which to calculate GST
            gst_rate: GST rate as percentage (e.g., 18 for 18%)
            
        Returns:
            Calculated GST amount
        """
        try:
            amount_decimal = Decimal(str(amount))
            rate_decimal = Decimal(str(gst_rate)) / Decimal('100')
            gst_amount = amount_decimal * rate_decimal
            return float(gst_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
        except Exception as e:
            logger.error(f"GST calculation error: {str(e)}")
            raise
    
    def calculate_total_with_gst(self, amount: float, gst_rate: float) -> Tuple[float, float, float]:
        """
        Calculate total amount including GST.
        
        Args:
            amount: Base amount
            gst_rate: GST rate as percentage
            
        Returns:
            Tuple of (base_amount, gst_amount, total_amount)
        """
        gst_amount = self.calculate_gst(amount, gst_rate)
        total = amount + gst_amount
        return round(amount, 2), gst_amount, round(total, 2)
    
    def calculate_amount_before_gst(self, total_amount: float, gst_rate: float) -> Tuple[float, float]:
        """
        Calculate base amount from total (inclusive of GST).
        
        Args:
            total_amount: Total amount including GST
            gst_rate: GST rate as percentage
            
        Returns:
            Tuple of (base_amount, gst_amount)
        """
        try:
            rate_multiplier = Decimal(str(gst_rate)) / Decimal('100')
            total_decimal = Decimal(str(total_amount))
            base_amount = total_decimal / (Decimal('1') + rate_multiplier)
            gst_amount = total_decimal - base_amount
            
            base = float(base_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
            gst = float(gst_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
            
            return base, gst
        except Exception as e:
            logger.error(f"Reverse GST calculation error: {str(e)}")
            raise
    
    def calculate_split_gst(self, total_amount: float, gst_rate: float) -> Dict[str, float]:
        """
        Calculate CGST, SGST, and IGST components.
        
        For intra-state transactions:
        - CGST = 50% of GST rate
        - SGST = 50% of GST rate
        
        For inter-state transactions:
        - IGST = Full GST rate
        
        Args:
            total_amount: Total amount including GST
            gst_rate: GST rate as percentage
            
        Returns:
            Dictionary with base_amount, cgst, sgst, igst components
        """
        base_amount, total_gst = self.calculate_amount_before_gst(total_amount, gst_rate)
        
        # Intra-state split (default)
        cgst = total_gst / 2
        sgst = total_gst / 2
        igst = 0.0
        
        return {
            'base_amount': round(base_amount, 2),
            'cgst': round(cgst, 2),
            'sgst': round(sgst, 2),
            'igst': round(igst, 2),
            'total_gst': round(total_gst, 2),
            'total_amount': round(total_amount, 2)
        }
    
    def get_gst_rate_for_category(self, category: str) -> float:
        """
        Get GST rate for a product/service category.
        
        Args:
            category: Product/service category
            
        Returns:
            GST rate for the category
            
        Raises:
            ValueError: If category not found
        """
        category_lower = category.lower()
        if category_lower not in self.STANDARD_GST_RATES:
            raise ValueError(f"Category '{category}' not found. Available: {list(self.STANDARD_GST_RATES.keys())}")
        
        return self.STANDARD_GST_RATES[category_lower]
    
    def get_all_categories(self) -> Dict[str, float]:
        """
        Get all available GST rate categories.
        
        Returns:
            Dictionary of categories and their GST rates
        """
        return self.STANDARD_GST_RATES.copy()
