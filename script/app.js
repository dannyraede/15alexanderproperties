;(function () {
	// DOM elements
	const video = document.getElementById("video")
	const canvas = document.getElementById("canvas")
	const captureBtn = document.getElementById("captureBtn")
	const fileInput = document.getElementById("fileInput")
	const resultContainer = document.getElementById("resultContainer")
	const switchCameraBtn = document.getElementById("switchCameraBtn")
	const cameraLoading = document.getElementById("cameraLoading")
	const cameraPermission = document.getElementById("cameraPermission")
	const newImageBtn = document.createElement("button")

	let currentFacingMode = "environment"
	let capturedImage = null // Store the captured image

	let scanningAnimationId = null

	// Function to initialize the camera
	async function initCamera(facingMode = "environment") {
		try {
			cameraLoading.classList.remove("hidden")
			cameraPermission.classList.add("hidden")
			video.classList.add("hidden")

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: facingMode },
			})
			video.srcObject = stream
			currentFacingMode = facingMode

			video.onloadedmetadata = () => {
				cameraLoading.classList.add("hidden")
				video.classList.remove("hidden")
			}
		} catch (err) {
			console.error("Error accessing camera:", err)
			cameraLoading.classList.add("hidden")
			cameraPermission.classList.remove("hidden")
			displayError("Error accessing camera. Please check your permissions.")
		}
	}

	// Function to switch camera
	async function switchCamera() {
		const newFacingMode = currentFacingMode === "environment" ? "user" : "environment"
		const currentStream = video.srcObject

		// Stop all tracks on the current stream
		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop())
		}

		await initCamera(newFacingMode)
	}

	// Function to capture photo
	function capturePhoto() {
		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		canvas.getContext("2d").drawImage(video, 0, 0)

		capturedImage = canvas.toDataURL("image/jpeg")
		showCapturedImage()
		canvas.toBlob(uploadPhoto, "image/jpeg")
	}

	// Function to show captured image
	function showCapturedImage() {
		video.style.display = "none"
		canvas.style.display = "block"
		canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
		switchToNewImageButton()
	}

	// Function to switch to "New Image" button
	function switchToNewImageButton() {
		captureBtn.style.display = "none"
		fileInput.parentElement.style.display = "none"
		newImageBtn.textContent = "New Image"
		newImageBtn.className = captureBtn.className // Copy classes from captureBtn
		newImageBtn.addEventListener("click", resetCapture)
		resultContainer.appendChild(newImageBtn)
	}

	// Function to reset capture
	function resetCapture() {
		video.style.display = "block"
		canvas.style.display = "none"
		captureBtn.style.display = "block"
		fileInput.parentElement.style.display = "block"
		newImageBtn.remove()
		resultContainer.innerHTML = ""
	}

	// Function to handle file upload
	function handleFileUpload(event) {
		const file = event.target.files[0]
		if (file) {
			uploadPhoto(file)
		}
	}

	// Function to upload photo and analyze
	let isUploading = false
	let uploadCount = 0

	async function uploadPhoto(blob) {
		if (isUploading) {
			console.log("Upload already in progress, ignoring this call")
			return
		}

		isUploading = true
		uploadCount++
		console.log(`uploadPhoto function called (Count: ${uploadCount})`, new Date().toISOString())

		try {
			console.log("Creating FormData")
			const formData = new FormData()
			formData.append("image", blob, "building.jpg")

			console.log("Displaying loading message and starting animation")
			displayLoading("Analyzing image... (This can take up to 60 sec, be patient!)")
			startScanningAnimation()

			console.log("Sending fetch request to /api/mainOrchestrator")
			const response = await fetch("/api/mainOrchestrator", {
				method: "POST",
				body: formData,
			})

			console.log("Fetch request completed, stopping animation")
			stopScanningAnimation()

			if (!response.ok) {
				console.error("Response not OK:", response.status, response.statusText)
				throw new Error("Upload and analysis failed")
			}

			console.log("Parsing response JSON")
			const results = await response.json()
			console.log("Results received:", JSON.stringify(results, null, 2))

			console.log("Displaying results")
			displayResults(results)
		} catch (error) {
			console.error("Error in uploadPhoto:", error.message)
			stopScanningAnimation()
			displayError("Error processing image. Please try again.")
		} finally {
			isUploading = false
			console.log(`uploadPhoto function completed (Count: ${uploadCount})`, new Date().toISOString())
		}
	}

	// Add these new functions

	function startScanningAnimation() {
		const scanLine = document.createElement("div")
		scanLine.id = "scanLine"
		scanLine.style.position = "absolute"
		scanLine.style.left = "0"
		scanLine.style.right = "0"
		scanLine.style.height = "4px"
		scanLine.style.backgroundColor = "rgba(0, 255, 0, 0.7)"
		scanLine.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.7)"
		scanLine.style.transition = "top 0.5s linear"
		scanLine.style.top = "0"

		const cameraContainer = document.getElementById("cameraContainer")
		cameraContainer.style.position = "relative"
		cameraContainer.appendChild(scanLine)

		let goingDown = true
		const animate = () => {
			const containerHeight = cameraContainer.offsetHeight
			const scanLineHeight = scanLine.offsetHeight
			const currentTop = parseInt(scanLine.style.top, 10)

			if (goingDown) {
				scanLine.style.top = `${currentTop + 2}px`
				if (currentTop + scanLineHeight >= containerHeight) {
					goingDown = false
				}
			} else {
				scanLine.style.top = `${currentTop - 2}px`
				if (currentTop <= 0) {
					goingDown = true
				}
			}
			scanningAnimationId = requestAnimationFrame(animate)
		}

		animate()
	}

	function stopScanningAnimation() {
		if (scanningAnimationId) {
			cancelAnimationFrame(scanningAnimationId)
			scanningAnimationId = null
		}
		const scanLine = document.getElementById("scanLine")
		if (scanLine) {
			scanLine.remove()
		}
		// Ensure the cameraContainer's position is reset
		const cameraContainer = document.getElementById("cameraContainer")
		if (cameraContainer) {
			cameraContainer.style.position = ""
		}
	}
	// Function to display results
	function displayResults(results) {
		let resultsHTML = '<div class="bg-white shadow-lg rounded-lg overflow-hidden">'

		// Add a "New Analysis" button above the results
		resultsHTML += `
			<button id="newAnalysisBtn" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105">
				New Analysis
			</button>
		`

		resultsHTML += '<div class="bg-blue-600 text-white px-4 py-2"><h2 class="text-xl font-bold">Analysis Results</h2></div>'
		resultsHTML += '<div class="p-4">'

		let hasResults = false
		for (const [property, data] of Object.entries(results)) {
			if (data.present) {
				hasResults = true
				resultsHTML += `
					<div class="mb-4 last:mb-0">
						<h3 class="text-lg font-semibold text-gray-800 mb-2">${formatPropertyName(property)}</h3>
						<p class="text-gray-600 text-sm leading-relaxed">${data.description.replace(/\n/g, "<br>")}</p>
					</div>
				`
			}
		}

		if (!hasResults) {
			resultsHTML += '<p class="text-gray-600 text-sm">No significant patterns were detected in this image.</p>'
		}

		resultsHTML += "</div>" // Close the p-4 div
		resultsHTML += "</div>" // Close the main container div

		resultContainer.innerHTML = resultsHTML

		// Add event listener to the new button
		document.getElementById("newAnalysisBtn").addEventListener("click", () => {
			location.reload()
		})
	}

	// Helper function to format property names
	function formatPropertyName(property) {
		return property
			.split(/(?=[A-Z])/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
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
	switchCameraBtn.addEventListener("click", switchCamera)

	// Initialize camera when the page loads
	initCamera()

	// Function to check if the device is mobile
	function isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	}

	// Show/hide switch camera button based on device type
	if (isMobile()) {
		switchCameraBtn.style.display = "block"
	} else {
		switchCameraBtn.style.display = "none"
	}
})()
