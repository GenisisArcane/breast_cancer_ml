from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
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

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({"error": "Missing features data"}), 400

        # Get features in correct order
        features = [data['features'].get(f, 0) for f in FEATURE_ORDER]
        scaled_features = scaler.transform([features])
        
        # Make prediction
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0][1]
        
        # Get feature importance based on model type
        if hasattr(model, 'feature_importances_'):
            # Random Forest/Decision Tree
            importances = model.feature_importances_.tolist()
        elif hasattr(model, 'coef_'):
            # Logistic Regression/SVM (absolute coefficients)
            importances = np.abs(model.coef_[0]).tolist()
        else:
            # SVM with RBF kernel (no native importance)
            result = permutation_importance(model, X_test_scaled, y_test, n_repeats=10)
            importances = result.importances_mean.tolist()
        
        response = {
            "prediction": "Malignant" if prediction == 1 else "Benign",
            "probability": float(probability),
            "feature_importances": dict(zip(FEATURE_ORDER, importances))
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
            
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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
