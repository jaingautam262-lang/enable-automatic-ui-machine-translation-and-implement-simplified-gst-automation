"""
Unit tests for the GST Calculator module.
"""

import pytest
from src.gst_automation.calculator import GSTCalculator


class TestGSTCalculator:
    """
    Test cases for GSTCalculator class.
    """
    
    @pytest.fixture
    def calculator(self):
        """Create calculator instance for testing."""
        return GSTCalculator()
    
    def test_calculator_initialization(self, calculator):
        """Test calculator initialization."""
        assert calculator is not None
        assert len(calculator.STANDARD_GST_RATES) > 0
    
    def test_calculate_gst(self, calculator):
        """Test GST calculation."""
        amount = 1000
        gst_rate = 18
        gst = calculator.calculate_gst(amount, gst_rate)
        assert gst == 180.0
    
    def test_calculate_total_with_gst(self, calculator):
        """Test total amount calculation with GST."""
        amount = 1000
        gst_rate = 18
        base, gst, total = calculator.calculate_total_with_gst(amount, gst_rate)
        assert base == 1000
        assert gst == 180.0
        assert total == 1180.0
    
    def test_calculate_amount_before_gst(self, calculator):
        """Test reverse GST calculation."""
        total = 1180
        gst_rate = 18
        base, gst = calculator.calculate_amount_before_gst(total, gst_rate)
        assert abs(base - 1000) < 0.01  # Allow for rounding
    
    def test_calculate_split_gst(self, calculator):
        """Test GST component split calculation."""
        total = 1180
        gst_rate = 18
        split = calculator.calculate_split_gst(total, gst_rate)
        assert 'cgst' in split
        assert 'sgst' in split
        assert split['cgst'] == split['sgst']  # Intra-state split
    
    def test_get_gst_rate_for_category(self, calculator):
        """Test getting GST rate for a category."""
        rate = calculator.get_gst_rate_for_category('food')
        assert rate == 5.0
    
    def test_invalid_category_raises_error(self, calculator):
        """Test that invalid category raises ValueError."""
        with pytest.raises(ValueError):
            calculator.get_gst_rate_for_category('invalid_category')
