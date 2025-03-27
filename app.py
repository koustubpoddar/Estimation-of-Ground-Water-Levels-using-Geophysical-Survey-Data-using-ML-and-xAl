                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
from flask import Flask, request, jsonify, send_from_directory, render_template
import pandas as pd
import joblib
from PIL import Image
import numpy as np
import os
import matplotlib.pyplot as plt
import io
import base64


print("Current working directory:", os.getcwd())


app = Flask(__name__)

# Load the trained model
model = joblib.load('Trained_model.pkl')

# Create a directory to store the output images
output_dir = 'output_images'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

@app.route('/')
def index():
     return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    csv_file = request.files['csv_file']
    df = pd.read_csv(csv_file)

    # Drop 'elec_pos' before making predictions to match training features
    df_features = df.drop(columns=['elec_pos'], errors='ignore')  # Ignore errors in case column is missing

    # Predict the groundwater presence
    predictions = model.predict(df_features)  # Use the corrected dataframe without 'elec_pos'

    # Generate the image
    image_name = '2d_subsurface_profile_presence.png'
    generate_image(df, predictions, image_name)  # Pass the original df for visualization

    # Return the image name as a JSON response
    return render_template('index.html', image_name=image_name, predictions=predictions.tolist())



def generate_image(df, predictions, image_name):
    # Reshape the data for visualization
    elec_pos_values = np.unique(df['elec_pos'])  # Unique electrode positions (X-axis)
    depth_values = np.unique(df['depth'])  # Unique depth values (Y-axis)
    X, Y = np.meshgrid(elec_pos_values, depth_values)  # Create meshgrid

    # Reshape predictions to fit into the grid
    Z = np.zeros(X.shape)
    index = 0
    for i, elec_pos in enumerate(elec_pos_values):
        for j, depth in enumerate(depth_values):
            if index < len(predictions):
                Z[j, i] = predictions[index]
            index += 1
            if index >= len(predictions):
                break

    # Generate the 2D contour plot
    plt.figure(figsize=(10, 8))
    contour = plt.contourf(X, Y, Z, levels=20, cmap='viridis')
    plt.colorbar(contour, label='Groundwater Presence')
    plt.xlabel('Electrode Position')
    plt.ylabel('Depth')
    plt.gca().invert_yaxis()  # Flip y-axis to match real-world depth
    plt.title('2D Subsurface Profile - Groundwater Presence')

    # Save the figure
    plt.savefig(os.path.join(output_dir, image_name), format='png')
    plt.close()


@app.route('/output_images/<path:image_name>')
def serve_image(image_name):
    return send_from_directory(output_dir, image_name)


if __name__ == '__main__':
    app.run(debug=True)