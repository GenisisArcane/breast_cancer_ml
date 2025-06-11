from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np


app = Flask(__name__)

# Load model and scaler
model = joblib.load('models/best_model.pkl')
scaler = joblib.load('models/scaler.pkl')

# Feature order must match training
FEATURE_ORDER = [
    'worst radius',
    'worst perimeter',
    'worst concave points',
    'mean concave points',
    'worst area',
    'worst compactness',
    'mean radius',
    'texture error',  # Captures measurement variability
    'worst texture',
    'area error',
    'mean smoothness',        # Local variation in radius lengths
    'mean symmetry',          # Cell symmetry
    'worst smoothness',       # Most abnormal smoothness
    'worst symmetry',         # Most asymmetric cells
    'mean concavity',         # Severity of concave contours
    'worst concavity',        # Most severe concavity
    'compactness error',      # Variability in compactness
    'concavity error',        # Variability in concavity
    'fractal dimension error'
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log incoming data
        
        if not data:
            print("Error: No JSON data received")
            return jsonify({'error': 'No data received'}), 400
            
        if 'features' not in data:
            print("Error: 'features' key missing")
            return jsonify({'error': 'Missing features data'}), 400
            
        # Log feature keys for verification
        print("Received features:", data['features'].keys())
        
        # Reorder columns to match training order
        # In app.py
        features = np.array([[float(data['features'][f]) for f in FEATURE_ORDER]])
        
        scaled_features = scaler.transform(features)
        prediction = model.predict(scaled_features)
        probability = model.predict_proba(scaled_features)[0][1]
        
        return jsonify({
            'prediction': 'Malignant' if prediction[0] == 1 else 'Benign',
            'probability': float(probability),
            'feature_importances': dict(zip(FEATURE_ORDER, model.feature_importances_.tolist()))
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
