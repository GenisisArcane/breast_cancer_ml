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
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({"error": "Missing features data"}), 400

        # Get features in correct order
        features = [float(data['features'].get(f, 0)) for f in FEATURE_ORDER]
        scaled_features = scaler.transform([features])
        
        # Make prediction
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0][1]
        
        # Get feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_.tolist()
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0]).tolist()
        else:
            importances = [1.0/len(FEATURE_ORDER)] * len(FEATURE_ORDER)
        
        return jsonify({
            "prediction": "Malignant" if prediction == 1 else "Benign",
            "probability": float(probability),
            "feature_importances": dict(zip(FEATURE_ORDER, importances))
        })
        
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Prediction failed"}), 500

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
