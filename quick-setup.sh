#!/bin/bash

# Quick setup script for launching the Flask application

# Update package list and install dependencies
echo "Updating package list..."
sudo apt-get update

echo "Installing necessary packages..."
sudo apt-get install -y python3 python3-pip python3-venv

echo "Setting up virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Flask..."
pip install Flask

echo "Running tests..."
# Assuming you have test.py for testing your Flask app
python test.py

echo "Launching Flask application..."
export FLASK_APP=app.py
flask run