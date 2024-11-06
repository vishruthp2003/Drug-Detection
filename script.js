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

    // Update the text to confirm the picture was captured
    document.getElementById("display-text").textContent = "Picture Captured!";

    // Run OCR to extract text from the image
    runOCR(canvas);
}

// Function to perform OCR on the captured image
function runOCR(canvas) {
    // Run Tesseract.js OCR on the canvas
    Tesseract.recognize(
        canvas,
        'eng',  // Language
        {
            logger: (m) => console.log(m), // Log progress
        }
    ).then(({ data: { text } }) => {
        // Display the extracted text
        console.log("OCR Text: ", text);
        document.getElementById("display-text").textContent = "Extracted Text: " + text;

        // Call API to get drug information based on the extracted text
        fetchDrugInfo(text);
    }).catch((error) => {
        console.error("OCR Error: ", error);
        document.getElementById("display-text").textContent = "OCR failed to extract text.";
    });
}

// Function to fetch drug information from an API
function fetchDrugInfo(drugName) {
    // Use a drug information API to fetch details based on the drug name.
    // Here, we will use the openFDA API for demonstration.
    const apiUrl = `https://api.fda.gov/drug/label.json?search=generic_name:"${drugName}"&limit=1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const drugInfo = data.results[0];
                displayDrugInfo(drugInfo);
            } else {
                document.getElementById("drug-info").innerHTML = "No drug information found.";
            }
        })
        .catch(error => {
            console.error("Error fetching drug info: ", error);
            document.getElementById("drug-info").innerHTML = "Error fetching drug information.";
        });
}

// Function to display drug information in the second box
function displayDrugInfo(drugInfo) {
    const infoDiv = document.getElementById("drug-info");
    infoDiv.innerHTML = `
        <h3>Drug Information:</h3>
        <p><strong>Brand Name:</strong> ${drugInfo.openfda.brand_name}</p>
        <p><strong>Generic Name:</strong> ${drugInfo.openfda.generic_name}</p>
        <p><strong>Description:</strong> ${drugInfo.description || "No description available."}</p>
        <p><strong>Indications:</strong> ${drugInfo.indications_and_usage || "No indications available."}</p>
    `;
}
