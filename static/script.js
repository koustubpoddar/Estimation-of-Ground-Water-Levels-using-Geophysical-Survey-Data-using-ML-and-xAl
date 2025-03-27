// Get the image container and predictions list
const imageContainer = document.getElementById('image-container');
const predictionsList = document.getElementById('predictions-list');

// Define the function to display the image and predictions
function displayResults(data) {
  // Get the image data
  const imageData = data.image_data;

  // Create an image element
  const image = document.createElement('img');
  image.src = `data:image/png;base64,${imageData}`;

  // Display the image
  imageContainer.innerHTML = '';
  imageContainer.appendChild(image);
}

// Define the function to handle the form submission
function handleSubmit(event) {
  event.preventDefault();

  // Get the CSV file
  const csvFile = document.getElementById('csv-file').files[0];

  // Create a new form data object
  const formData = new FormData();
  formData.append('csv_file', csvFile);

  // Send the request to the server
  fetch('/analyze', {
      method: 'POST',
      body: formData,
  })
  .then((response) => response.json())
  .then((data) => {
      // Return the image data in the response
      return data.image_data;
  })
  .then((imageData) => displayResults({ image_data: imageData }))
  .catch((error) => console.error(error));
}

// Add an event listener to the form submission
document.getElementById('analyze-form').addEventListener('submit', handleSubmit);