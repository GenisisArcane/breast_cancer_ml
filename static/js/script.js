// Complete Breast Cancer Prediction Web Application
// Configuration - Feature definitions with descriptions and validation ranges
const FEATURE_CONFIG = {
    worst_radius: {
        description: "Largest radius measurement",
        min: 7.93,
        max: 36.04,
        unit: "μm"
    },
    worst_perimeter: {
        description: "Largest perimeter measurement",
        min: 50.41,
        max: 251.2,
        unit: "μm"
    },
    worst_concave_points: {
        description: "Largest number of concave points",
        min: 0.0,
        max: 0.291,
        unit: ""
    },
    mean_concave_points: {
        description: "Mean number of concave portions of contour",
        min: 0.0,
        max: 0.2012,
        unit: ""
    },
    worst_area: {
        description: "Largest area measurement",
        min: 185.2,
        max: 4254.0,
        unit: "μm²"
    },
    worst_compactness: {
        description: "Most severe compactness measurement",
        min: 0.02729,
        max: 1.058,
        unit: ""
    },
    mean_radius: {
        description: "Mean radius of tumor cells (microns)",
        min: 6.981,
        max: 28.11,
        unit: "μm"
    },
    texture_error: {
        description: "Standard error of texture measurements",
        min: 0.3602,
        max: 4.885,
        unit: ""
    },
    worst_texture: {
        description: "Most severe texture measurement",
        min: 12.02,
        max: 49.54,
        unit: ""
    },
    area_error: {
        description: "Standard error of area measurements",
        min: 6.802,
        max: 542.2,
        unit: "μm²"
    },

    mean_smoothness: {
        description: "Mean local variation in radius lengths",
        min: 0.05263,
        max: 0.1634,
        unit: ""
    },
    mean_symmetry: {
        description: "Mean symmetry of tumor cell nuclei",
        min: 0.106,
        max: 0.304,
        unit: ""
    },
    worst_smoothness: {
        description: "Most severe local variation in radius lengths",
        min: 0.07117,
        max: 0.2226,
        unit: ""
    },
    worst_symmetry: {
        description: "Most asymmetric tumor cell nuclei measurement",
        min: 0.1565,
        max: 0.6638,
        unit: ""
    },
    mean_concavity: {
        description: "Mean severity of concave portions of contour",
        min: 0.0,
        max: 0.4268,
        unit: ""
    },
    worst_concavity: {
        description: "Most severe concave portions of contour",
        min: 0.0,
        max: 1.252,
        unit: ""
    },
    compactness_error: {
        description: "Standard error of compactness measurements",
        min: 0.002252,
        max: 0.1354,
        unit: ""
    },
    concavity_error: {
        description: "Standard error of concavity measurements",
        min: 0.0,
        max: 0.396,
        unit: ""
    },
    fractal_dimension_error: {
        description: "Standard error of fractal dimension measurements",
        min: 0.0008948,
        max: 0.02984,
        unit: ""
    }
  
    
    
    
};

// DOM Elements
const form = document.getElementById('prediction-form');
const resultContainer = document.getElementById('result-container');
const loadingSpinner = document.getElementById('loading-spinner');
const detailsModal = new bootstrap.Modal(document.getElementById('details-modal'));

// Initialize the application
function initApp() {
    createFormInputs();
    setupEventListeners();
    restoreFormData();
}

// In your script.js
const FEATURE_CONFIG = {
    'worst_radius': {
        description: "Largest radius measurement (microns)",
        min: 7.93,
        max: 36.04,
        unit: "μm"
    },
    'worst_perimeter': {
        description: "Largest perimeter measurement (microns)",
        min: 50.41,
        max: 251.2,
        unit: "μm"
    },
    // Add all 19 features in this format...
};

function createFormInputs() {
    const container = document.getElementById('form-fields');
    container.innerHTML = ''; // Clear existing fields

    Object.entries(FEATURE_CONFIG).forEach(([feature, config]) => {
        const group = document.createElement('div');
        group.className = 'form-group col-md-6';

        const label = document.createElement('label');
        label.textContent = feature.replace(/_/g, ' ');
        label.htmlFor = feature;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control';
        input.id = feature;
        input.name = feature;
        input.min = config.min;
        input.max = config.max;
        input.step = '0.0001';
        input.required = true;

        if (config.unit) {
            const unitSpan = document.createElement('span');
            unitSpan.className = 'input-group-text';
            unitSpan.textContent = config.unit;
            input.classList.add('with-unit');
        }

        const helpText = document.createElement('small');
        helpText.className = 'form-text text-muted';
        helpText.textContent = config.description;

        group.appendChild(label);
        group.appendChild(input);
        if (config.unit) group.appendChild(unitSpan);
        group.appendChild(helpText);
        container.appendChild(group);
    });
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', () => {
    createFormInputs();
    
    document.getElementById('prediction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Your existing submission handler
    });
});
// Format feature names for display
function formatFeatureName(feature) {
    return feature
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Set up event listeners
function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    
    // Add input validation on blur
    document.querySelectorAll('.feature-input').forEach(input => {
        input.addEventListener('blur', validateInput);
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

// Validate individual input
function validateInput(e) {
    const input = e.target;
    const feature = input.dataset.feature;
    const config = FEATURE_CONFIG[feature];
    const value = parseFloat(input.value);

    if (isNaN(value)) {
        setInputError(input, 'Please enter a valid number');
        return false;
    }

    if (value < config.min || value > config.max) {
        setInputError(input, `Value must be between ${config.min} and ${config.max}`);
        return false;
    }

    clearInputError(input);
    return true;
}

// Set input error state
function setInputError(input, message) {
    input.classList.add('is-invalid');
    let feedback = input.nextElementSibling;
    
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    
    feedback.textContent = message;
}

// Clear input error state
function clearInputError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.remove();
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    document.querySelectorAll('.feature-input').forEach(input => {
        const event = { target: input };
        if (!validateInput(event)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please correct the invalid fields before submitting', 'danger');
        return;
    }
    
    try {
        showLoading(true);
        saveFormData();
        
        const features = collectFormData();
        const response = await sendPredictionRequest(features);
        
        if (response.ok) {
            const result = await response.json();
            displayResults(result);
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Prediction failed:', error);
        showAlert(`Prediction failed: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

// Collect form data
function collectFormData() {
    const features = {};
    let isValid = true;
    
    Object.keys(FEATURE_CONFIG).forEach(feature => {
        const input = document.getElementById(feature);
        const value = parseFloat(input.value);
        
        if (isNaN(value)) {
            setInputError(input, 'Please enter a valid number');
            isValid = false;
        }
        
        features[feature] = value;
    });
    
    if (!isValid) throw new Error('Validation failed');
    return features;
}

function formatFeatureName(feature) {
    return feature.replace(/_/g, ' ');  // Convert underscores to spaces
}
// Send prediction request to server
async function sendPredictionRequest(features) {
    try {
        console.log("Sending features:", features); // Debug log
        
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ features })
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Non-JSON response:", text);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!response.ok) {
            console.error("API error:", data);
            throw new Error(data.error || `Prediction failed (${response.status})`);
        }
        
        return data;
    } catch (error) {
        console.error('Full error:', error);
        showAlert(`Prediction error: ${error.message}`);
        throw error;
    }
}
}
// Display prediction results
function displayResults({ prediction, probability, feature_importances }) {
    resultContainer.innerHTML = '';
    
    const riskLevel = getRiskLevel(probability);
    const riskClass = riskLevel.toLowerCase().replace(/\s+/g, '-');
    const isMalignant = prediction === 'Malignant';
    
    const resultCard = document.createElement('div');
    resultCard.className = 'card result-card mb-4';
    
    resultCard.innerHTML = `
        <div class="card-body">
            <h2 class="card-title">Diagnosis Result</h2>
            
            <div class="diagnosis-display mb-4">
                <span class="diagnosis-badge ${isMalignant ? 'bg-danger' : 'bg-success'}">
                    ${prediction}
                </span>
                <div class="confidence-level">
                    Confidence: ${(probability * 100).toFixed(1)}%
                </div>
            </div>
            
            <div class="risk-assessment mb-4">
                <h3>Risk Assessment: <span class="risk-${riskClass}">${riskLevel}</span></h3>
                <div class="progress">
                    <div class="progress-bar bg-${riskClass}" 
                         role="progressbar" 
                         style="width: ${probability * 100}%"
                         aria-valuenow="${probability * 100}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
            
            ${isMalignant ? `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Warning:</strong> This prediction suggests a malignant tumor. 
                Please consult with a healthcare professional immediately.
            </div>` : `
            <div class="alert alert-success">
                <i class="bi bi-check-circle-fill"></i>
                This prediction suggests a benign tumor, but regular check-ups are still recommended.
            </div>`}
            
            <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-outline-primary" id="details-btn">
                    <i class="bi bi-bar-chart-fill"></i> View Detailed Analysis
                </button>
                <button class="btn btn-primary" id="new-prediction-btn">
                    <i class="bi bi-arrow-repeat"></i> New Prediction
                </button>
            </div>
        </div>
    `;
    
    resultContainer.appendChild(resultCard);
    
    // Set up event listeners for the new buttons
    document.getElementById('details-btn').addEventListener('click', () => {
        showDetailedAnalysis(feature_importances);
    });
    
    document.getElementById('new-prediction-btn').addEventListener('click', () => {
        resultContainer.innerHTML = '';
        form.scrollIntoView({ behavior: 'smooth' });
    });
}

// Show detailed analysis in modal
function showDetailedAnalysis(featureImportances) {
    if (!featureImportances) {
        showAlert('Detailed analysis data not available', 'warning');
        return;
    }
    
    const modalBody = document.getElementById('modal-analysis-content');
    modalBody.innerHTML = `
        <h4>Feature Importance Analysis</h4>
        <p>These are the features that most influenced the prediction:</p>
        <div id="feature-importance-chart" class="mb-4"></div>
        
        <h4>Clinical Recommendations</h4>
        <ul>
            <li>Consult with an oncologist for comprehensive evaluation</li>
            <li>Consider additional diagnostic imaging if not already performed</li>
            <li>Discuss potential biopsy options with your healthcare provider</li>
            <li>Review family history of breast cancer</li>
        </ul>
    `;
    
    // In a real app, you would render a chart here using a library like Chart.js
    renderFeatureImportanceChart(featureImportances);
    
    detailsModal.show();
}

// Render feature importance chart (placeholder)
function renderFeatureImportanceChart(featureImportances) {
    const chartContainer = document.getElementById('feature-importance-chart');
    
    // Sort features by importance
    const sortedFeatures = Object.entries(featureImportances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Show top 10 features
    
    // Create a simple bar chart (in a real app, use Chart.js or similar)
    chartContainer.innerHTML = `
        <div class="feature-importance-chart">
            ${sortedFeatures.map(([feature, importance]) => `
                <div class="chart-row mb-2">
                    <div class="feature-name">${formatFeatureName(feature)}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${importance * 100}%"></div>
                        <span class="chart-value">${(importance * 100).toFixed(1)}%</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Helper function to determine risk level
function getRiskLevel(probability) {
    if (probability >= 0.9) return "Critical Risk";
    if (probability >= 0.7) return "High Risk";
    if (probability >= 0.3) return "Moderate Risk";
    return "Low Risk";
}

// Show loading state
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        form.querySelector('button[type="submit"]').disabled = true;
    } else {
        loadingSpinner.classList.add('d-none');
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    resultContainer.innerHTML = '';
    resultContainer.appendChild(alert);
}

// Save form data to localStorage
function saveFormData() {
    const formData = {};
    
    Object.keys(FEATURE_CONFIG).forEach(feature => {
        formData[feature] = document.getElementById(feature).value;
    });
    
    localStorage.setItem('breastCancerPredictionForm', JSON.stringify(formData));
}

// Restore form data from localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('breastCancerPredictionForm');
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            Object.entries(formData).forEach(([feature, value]) => {
                const input = document.getElementById(feature);
                if (input) input.value = value;
            });
        } catch (e) {
            console.error('Failed to restore form data:', e);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
