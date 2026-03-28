#!/bin/bash

# Script to automate file creation and git push commands

# Define the file name and content
FILE_NAME="newfile.txt"
CONTENT="This is a new file created by the setup-and-push.sh script."

# Create the file
echo "$CONTENT" > $FILE_NAME

# Add the file to the Git staging area
git add $FILE_NAME

# Commit the changes
git commit -m "Automated file creation: $FILE_NAME"

# Push changes to the repository
git push origin main
