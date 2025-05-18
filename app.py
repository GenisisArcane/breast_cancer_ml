from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np


app = Flask(__name__)

# Load model and scaler
model = joblib.load('models/random_forest_model.pkl')
scaler = joblib.load('models/scaler.pkl')

# Feature order must match training
FEATURE_ORDER = [
    'mean_radius', 'mean_texture', 'mean_perimeter', 'mean_area',
    'mean_smoothness', 'mean_compactness', 'mean_concavity',
    'mean_concave_points', 'mean_symmetry', 'mean_fractal_dimension',
    'radius_error', 'texture_error', 'perimeter_error', 'area_error',
    'smoothness_error', 'compactness_error', 'concavity_error',
    'concave_points_error', 'symmetry_error', 'fractal_dimension_error',
    'worst_radius', 'worst_texture', 'worst_perimeter', 'worst_area',
    'worst_smoothness', 'worst_compactness', 'worst_concavity',
    'worst_concave_points', 'worst_symmetry', 'worst_fractal_dimension'
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'error': 'Missing features data'}), 400
        
        # Convert to DataFrame to preserve feature names
        import pandas as pd
        features = pd.DataFrame([data['features']])
        
        # Reorder columns to match training order
        features = features[FEATURE_ORDER]
        
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
