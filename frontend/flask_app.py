import os
import boto3
from flask import Flask, render_template, request, redirect, url_for, session, flash
import random
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configure S3
# S3_BUCKET = "steam-csv-file-upload"
# S3_ACCESS_KEY = ""
# S3_SECRET_KEY = "
# S3_REGION = "us-east-1"  # Example: 'us-east-1'
# Temporary storage for OTPs
user_otps = {}

# Initialize the S3 client
s3_client = boto3.client(
    's3',
    region_name=S3_REGION,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY
)

@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/send_otp', methods=['POST'])
def send_otp():
    username = request.form['username']
    if username == 'admin@gmail.com':
        otp = str(random.randint(100000, 999999))  # Generate random 6-digit OTP
        user_otps[username] = otp
        session['username'] = username  # Store username in session

        # Simulate OTP sending (print it to console, in real app send via email/SMS)
        print(f"OTP for {username}: {otp}")
        flash(f"OTP for {username}: {otp}")
        return redirect(url_for('otp_page'))
    else:
        flash('Invalid username. Please try again.')
        return redirect(url_for('login_page'))

@app.route('/otp')
def otp_page():
    return render_template('otp.html')

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    username = session.get('username')
    otp = request.form['otp']

    if username in user_otps and user_otps[username] == otp:
        del user_otps[username]  # OTP verified, remove it
        return redirect(url_for('upload_page'))
    else:
        return redirect(url_for('otp_page'))

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

# Handle file upload and save to S3
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(url_for('upload_page'))
    
    file = request.files['file']

    # Check if file was selected
    if file.filename == '':
        flash('No selected file')
        return redirect(url_for('upload_page'))

    # Ensure the uploaded file is a CSV
    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)  # Make the filename safe
        try:
            # Upload file to S3 bucket
            s3_client.upload_fileobj(
                file,
                S3_BUCKET,
                filename
                # ExtraArgs={'ACL': 'public-read'}
            )
            flash('File uploaded successfully to S3!') 
            flash('Once a match is found email will be sent shortly!! Stay tuned !!!!!!')
            print('File uploaded successfully to S3!')
            return redirect(url_for('upload_page'))
        except Exception as e:
            flash(f'Error uploading file: {str(e)}')
            print(f'Error uploading file: {str(e)}')
            return redirect(url_for('upload_page'))
    else:
        flash('Only CSV files are allowed!')
        print('Only CSV files are allowed!')
        return redirect(url_for('upload_page'))

if __name__ == "__main__":
    app.run(debug=True)
