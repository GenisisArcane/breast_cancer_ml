from flask import Flask, request, jsonify, render_template, send_from_directory
import joblib
import numpy as np
import os
from sklearn.inspection import permutation_importance

app = Flask(__name__)

# Load model and scaler
try:
    model = joblib.load('models/best_model.pkl')
    scaler = joblib.load('models/scaler.pkl')
except Exception as e:
    print(f"Error loading model files: {str(e)}")
    raise

# Feature order must match training
FEATURE_ORDER = [
    'worst radius',
    'worst perimeter',
    'worst concave points',
    'mean concave points',
    'worst area', 
    'worst compactness',
    'mean radius',
    'texture error',
    'worst texture',
    'area error',
    'mean smoothness',
    'mean symmetry',
    'worst smoothness',
    'worst symmetry',
    'mean concavity',
    'worst concavity',
    'compactness error',
    'concavity error',
    'fractal dimension error'
]

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Debug logging
        app.logger.info("Received prediction request")
        
        data = request.get_json()
        if not data:
            app.logger.error("No JSON data received")
            return jsonify({"error": "No data received"}), 400
            
        if 'features' not in data:
            app.logger.error("Missing features in request")
            return jsonify({"error": "Missing features data"}), 400

        # Validate all features exist
        missing_features = [f for f in FEATURE_ORDER if f not in data['features']]
        if missing_features:
            app.logger.error(f"Missing features: {missing_features}")
            return jsonify({"error": f"Missing features: {missing_features}"}), 400

        # Get features in correct order
        try:
            features = [float(data['features'][f]) for f in FEATURE_ORDER]
            scaled_features = scaler.transform([features])
        except ValueError as e:
            app.logger.error(f"Invalid feature values: {str(e)}")
            return jsonify({"error": "Invalid feature values"}), 400
            
        # Make prediction
        try:
            prediction = model.predict(scaled_features)[0]
            probability = model.predict_proba(scaled_features)[0][1]
        except Exception as e:
            app.logger.error(f"Prediction failed: {str(e)}")
            return jsonify({"error": "Model prediction failed"}), 500
        
        return jsonify({
            "prediction": "Malignant" if prediction == 1 else "Benign",
            "probability": float(probability),
            "feature_importances": dict(zip(FEATURE_ORDER, model.feature_importances_.tolist()))
        })
        
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
        
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": hasattr(model, 'predict')
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
