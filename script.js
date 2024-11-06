// Access the camera and stream video to the video element
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Request access to the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error("Error accessing camera: ", error);
        document.getElementById("display-text").textContent = "Camera access denied.";
    });

// Function to capture the picture
function capturePicture() {
    // Set canvas size to match the video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame from the video to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Display the captured image in the first box
    const capturedImage = canvas.toDataURL("image/png").replace("data:image/png;base64,", ""); // Get Base64 of image
    const imageElement = document.createElement('img');
    imageElement.src = "data:image/png;base64," + capturedImage;
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    document.getElementById("capture-box").innerHTML = '';  // Clear previous content
    document.getElementById("capture-box").appendChild(imageElement);  // Append the captured image

    // Update the text to confirm the picture was captured
    document.getElementById("display-text").textContent = "Picture Captured!";

    // Send the image to Google API to extract text and information
    fetchDrugInfoFromImage(capturedImage);
}

// Function to send the image to the Google Vision API or another relevant Google API
function fetchDrugInfoFromImage(base64Image) {
    const apiKey = 'YOUR_API_KEY_HERE';  // Replace with your actual Google API key
    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;

    // Prepare the payload for the API request
    const payload = {
        requests: [
            {
                image: { content: base64Image },
                features: [{ type: "TEXT_DETECTION" }]
            }
        ]
    };

    // Send the request to the Google Vision API
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("API Response:", data);
        if (data.responses && data.responses[0].fullTextAnnotation) {
            const detectedText = data.responses[0].fullTextAnnotation.text;
            displayDrugInfo(detectedText);
        } else {
            document.getElementById("drug-info").innerHTML = "No drug information found.";
        }
    })
    .catch(error => {
        console.error("Error fetching data from Google Vision API:", error);
        document.getElementById("drug-info").innerHTML = "Error fetching drug information.";
    });
}

// Function to display drug information in the second box
function displayDrugInfo(detectedText) {
    const infoDiv = document.getElementById("drug-info");
    infoDiv.innerHTML = `<h3>Drug Information Detected:</h3><p>${detectedText}</p>`;
}
