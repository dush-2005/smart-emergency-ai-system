from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained AI model
model = joblib.load('model.pkl')

contacts = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Save emergency contact
@app.route('/add_contact', methods=['POST'])
def add_contact():
    data = request.json
    contacts.append(data)
    return jsonify({'message': 'Contact saved successfully'})

# AI accident prediction
@app.route('/predict_accident', methods=['POST'])
def predict_accident():
    data = request.json

    features = np.array([[
        data['acc'],
        data['gyro'],
        data['speed_drop'],
        data['no_motion']
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return jsonify({
        'accident': bool(prediction),
        'probability': round(float(probability), 2)
    })

# Receive GPS location
@app.route('/send_location', methods=['POST'])
def send_location():
    data = request.json
    print('Emergency Location:', data)
    return jsonify({'message': 'Location received successfully'})

if __name__ == '__main__':
    app.run(debug=True)