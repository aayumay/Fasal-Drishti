import numpy as np
import tensorflow as tf
from PIL import Image
import io
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_disease_model.tflite")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "classes.txt")

# Global variables to cache model in memory
_interpreter = None
_input_details = None
_output_details = None
_class_names = []

# Baseline fallback map with treatments
DISEASE_INFO = {
    "Early_Blight": {
        "severity": "High",
        "action": "Apply copper-based fungicide immediately. Remove infected lower leaves."
    },
    "Late_Blight": {
        "severity": "Critical",
        "action": "Apply Chlorothalonil immediately. Isolate and destroy infected plants."
    },
    "Healthy": {
        "severity": "Low",
        "action": "Crop looks perfectly healthy! Maintain your current watering schedule."
    },
    "Nitrogen_Deficiency": {
        "severity": "Moderate",
        "action": "Apply urea or nitrogen-rich fertilizer. Monitor soil pH."
    },
    "Pests": {
        "severity": "Moderate",
        "action": "Spray Neem oil extract or targeted insecticide. Check undersides of leaves."
    },
    "Unknown": {
        "severity": "Unknown",
        "action": "Could not identify the condition. Please consult a local agricultural expert."
    }
}

def load_model():
    global _interpreter, _input_details, _output_details, _class_names
    
    if _interpreter is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Please run train_mobilenet.py first.")
            
        _interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        _interpreter.allocate_tensors()
        _input_details = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()
        
        if os.path.exists(CLASSES_PATH):
            with open(CLASSES_PATH, "r") as f:
                _class_names = [line.strip() for line in f.readlines()]
        else:
            _class_names = ["Unknown"]

def predict_image(image_bytes):
    try:
        load_model()
        
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32)
        
        # Preprocess input same as training (MobileNetV2 expects -1 to 1)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Run inference
        _interpreter.set_tensor(_input_details[0]['index'], img_array)
        _interpreter.invoke()
        output_data = _interpreter.get_tensor(_output_details[0]['index'])[0]
        
        # Get top prediction
        class_idx = np.argmax(output_data)
        confidence = float(output_data[class_idx]) * 100
        
        raw_disease_name = _class_names[class_idx] if class_idx < len(_class_names) else "Unknown"
        
        # Fallback to defaults if name is slightly different
        disease_info = DISEASE_INFO.get(raw_disease_name, DISEASE_INFO["Unknown"])
        
        return {
            "disease": raw_disease_name.replace('_', ' '),
            "confidence": round(confidence, 2),
            "severity": disease_info["severity"],
            "action": disease_info["action"]
        }
    except Exception as e:
        print(f"Inference error: {e}")
        return {
            "disease": "Error Processing Image",
            "confidence": 0.0,
            "severity": "Unknown",
            "action": "System encountered an error processing the image."
        }
