from flask import Flask, request, jsonify
import joblib
import numpy as np
import os  # Added missing import
from sklearn.inspection import permutation_importance

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
            # For demonstration - in production load test data or cache this
            importances = [1.0/len(FEATURE_ORDER)] * len(FEATURE_ORDER)
        
        return jsonify({
            "prediction": "Malignant" if prediction == 1 else "Benign",
            "probability": float(probability),
            "feature_importances": dict(zip(FEATURE_ORDER, importances))
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/')
def home():
    return render_template('index.html')  # Or a simple response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
