import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import os
import numpy as np
from PIL import Image

# This script trains a dummy MobileNetV2 model to establish the real inference pipeline
# Replace the dataset/ directory with real images to train a production-ready model.

BASE_DIR = os.path.dirname(__file__)
DATASET_DIR = os.path.join(BASE_DIR, "dataset/")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "crop_disease_model.tflite")
CLASSES_PATH = os.path.join(BASE_DIR, "classes.txt")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 1 # Just 1 epoch to quickly generate the dummy structure

# Classes matching the SaaS diagnosis fallback dictionary
TARGET_CLASSES = ["Early_Blight", "Healthy", "Late_Blight", "Nitrogen_Deficiency", "Pests"]

def create_dummy_dataset():
    """Creates a small dummy dataset to test the training pipeline."""
    print("Creating dummy dataset for testing...")
    for cls in TARGET_CLASSES:
        os.makedirs(os.path.join(DATASET_DIR, cls), exist_ok=True)
        for i in range(5): # Just 5 images per class for speed
            img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            Image.fromarray(img).save(os.path.join(DATASET_DIR, cls, f"dummy_{i}.jpg"))

def build_model(num_classes):
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze the base model
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    if not os.path.exists(DATASET_DIR):
        create_dummy_dataset()
        
    print("Loading dataset...")
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    class_names = train_ds.class_names
    print(f"Classes found: {class_names}")
    
    # Save classes to a text file for inference
    with open(CLASSES_PATH, "w") as f:
        f.write("\n".join(class_names))

    # Preprocessing layer (MobileNetV2 expects inputs between -1 and 1)
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    
    train_ds = train_ds.map(lambda x, y: (preprocess_input(x), y))
    val_ds = val_ds.map(lambda x, y: (preprocess_input(x), y))

    print("Building model...")
    model = build_model(len(class_names))
    
    print("Training model...")
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)
    
    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    
    with open(MODEL_SAVE_PATH, "wb") as f:
        f.write(tflite_model)
        
    print(f"TFLite model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    main()
