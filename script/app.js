// DOM elements
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const captureBtn = document.getElementById("captureBtn")
const fileInput = document.getElementById("fileInput")
const resultContainer = document.getElementById("resultContainer")

// Function to initialize the camera
async function initCamera() {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true })
		video.srcObject = stream
	} catch (err) {
		console.error("Error accessing camera:", err)
		displayError("Error accessing camera. Please check your permissions.")
	}
}

// Function to capture photo
function capturePhoto() {
	canvas.width = video.videoWidth
	canvas.height = video.videoHeight
	canvas.getContext("2d").drawImage(video, 0, 0)

	canvas.toBlob(uploadPhoto, "image/jpeg")
}

// Function to handle file upload
function handleFileUpload(event) {
	const file = event.target.files[0]
	if (file) {
		uploadPhoto(file)
	}
}

// Function to upload photo to backend
async function uploadPhoto(blob) {
	try {
		const formData = new FormData()
		formData.append("image", blob, "building.jpg")

		displayLoading("Uploading image...")

		const response = await fetch("/api/upload", {
			method: "POST",
			body: formData,
		})

		if (!response.ok) {
			throw new Error("Upload failed")
		}

		const { imageUrl } = await response.json()
		analyzeImage(imageUrl)
	} catch (error) {
		console.error("Error uploading image:", error)
		displayError("Error uploading image. Please try again.")
	}
}

// Function to send image for analysis
async function analyzeImage(imageUrl) {
	try {
		displayLoading("Analyzing image...")

		const response = await fetch("/api/analyze", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ imageUrl }),
		})

		if (!response.ok) {
			throw new Error("Analysis failed")
		}

		const results = await response.json()
		displayResults(results)
	} catch (error) {
		console.error("Error analyzing image:", error)
		displayError("Error analyzing image. Please try again.")
	}
}

// Function to display results
function displayResults(results) {
	let resultsHTML = '<h2 class="text-xl font-bold mb-2">Results:</h2>'
	for (const [pattern, data] of Object.entries(results.patterns)) {
		resultsHTML += `
            <div class="mb-2">
                <span class="font-semibold">${pattern.replace("_", " ")}:</span> 
                ${data.present ? "✅" : "❌"}
                <p class="text-sm">${data.description || ""}</p>
            </div>
        `
	}

	resultContainer.innerHTML = resultsHTML
}

// Function to display error messages
function displayError(message) {
	resultContainer.innerHTML = `
		<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
			<div class="flex items-center">
				<svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<p>${message}</p>
			</div>
		</div>
	`
}

// Function to display loading messages
function displayLoading(message) {
	resultContainer.innerHTML = `
		<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded" role="alert">
			<div class="flex items-center">
				<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p>${message}</p>
			</div>
		</div>
	`
}

// Event listeners
captureBtn.addEventListener("click", capturePhoto)
fileInput.addEventListener("change", handleFileUpload)

// Initialize camera when the page loads
initCamera()
