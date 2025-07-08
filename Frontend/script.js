// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeButton = document.getElementById('resizeButton');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const downloadLink = document.getElementById('downloadLink');
const statusMessage = document.getElementById('statusMessage');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

// Initialize the app
function init() {
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  // Drag and drop functionality
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  uploadArea.addEventListener('click', triggerFileInput);
  fileInput.addEventListener('change', handleFileSelect);
  
  // Input validation
  [widthInput, heightInput].forEach(input => {
    input.addEventListener('input', validateInputs);
  });
  
  // Resize button
  resizeButton.addEventListener('click', uploadAndResize);
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('active');
}

function handleDragLeave() {
  uploadArea.classList.remove('active');
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('active');
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelect();
  }
}

function triggerFileInput() {
  fileInput.click();
}

// File selection handler
function handleFileSelect() {
  if (fileInput.files.length) {
    uploadArea.classList.add('active');
    validateInputs();
    
    // Show a preview of the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

// Validate form inputs
function validateInputs() {
  const fileSelected = fileInput.files.length > 0;
  const widthValid = widthInput.value && parseInt(widthInput.value) > 0;
  const heightValid = heightInput.value && parseInt(heightInput.value) > 0;
  
  resizeButton.disabled = !(fileSelected && widthValid && heightValid);
}

// Main function to handle upload and resize
async function uploadAndResize() {
  const file = fileInput.files[0];
  const width = widthInput.value;
  const height = heightInput.value;

  if (!file || !width || !height) {
    showStatus('Please select a file and enter dimensions', 'error');
    return;
  }

  // Validate dimensions
  if (width > 3000 || height > 3000) {
    showStatus('Maximum dimension size is 3000px', 'error');
    return;
  }

  const key = encodeURIComponent(file.name.replace(/\s+/g, '-').toLowerCase());
  
  try {
    // Reset UI
    resizeButton.disabled = true;
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    showStatus('Starting upload process...');

    // Step 1: Get pre-signed URL
    showStatus('Requesting upload URL...');
    progressBar.style.width = '10%';
    
    const uploadUrlRes = await fetch(`https://1nrpu12tc1.execute-api.us-east-1.amazonaws.com/prod/upload-url?key=${key}`);
    
    if (!uploadUrlRes.ok) {
      const err = await uploadUrlRes.text();
      throw new Error(`Failed to get upload URL: ${err}`);
    }

    const parsed = await uploadUrlRes.json();
    const uploadUrl = parsed.uploadUrl;

    if (!uploadUrl) {
      throw new Error('No upload URL returned from server');
    }

    // Step 2: Upload the file
    showStatus('Uploading your image...');
    progressBar.style.width = '30%';
    
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 
        'Content-Type': file.type || 'application/octet-stream'
      }
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Upload failed: ${err}`);
    }

    // Step 3: Trigger resize
    showStatus('Resizing your image...');
    progressBar.style.width = '60%';
    
    const resizeUrl = `https://1nrpu12tc1.execute-api.us-east-1.amazonaws.com/prod/resize?key=${key}&width=${width}&height=${height}`;
    const resizedRes = await fetch(resizeUrl);

    if (!resizedRes.ok) {
      const err = await resizedRes.text();
      throw new Error(`Resize failed: ${err}`);
    }

    // Step 4: Fetch resized image as a Blob
    const resizedImageUrl = await resizedRes.text();
    progressBar.style.width = '90%';
    showStatus('Preparing your download...');

    // Fetch the image as a Blob
    const imageBlobRes = await fetch(resizedImageUrl);
    const blob = await imageBlobRes.blob();

    // Create an object URL
    const blobUrl = URL.createObjectURL(blob);

    // Set preview image and download link
    previewImage.src = blobUrl;
    downloadLink.href = blobUrl;
    downloadLink.download = `resized-${width}x${height}-${file.name}`;

    progressBar.style.width = '100%';
    showStatus('Your image is ready! Click the download button below.', 'success');
    previewContainer.style.display = 'block';
    
  } catch (err) {
    console.error('Error:', err);
    showStatus(err.message, 'error');
  } finally {
    resizeButton.disabled = false;
  }
}

// Show status messages
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  
  if (type === 'success') {
    statusMessage.classList.add('success');
  } else if (type === 'error') {
    statusMessage.classList.add('error');
  } else {
    statusMessage.style.display = 'block';
    statusMessage.style.backgroundColor = '#f8f9fa';
    statusMessage.style.color = '#212529';
  }
}

// Initialize the application
init();
