// Immediately Invoked Function Expression (IIFE) to encapsulate the code and avoid polluting the global scope
;(function () {
	// DOM element references
	const fileInput = document.getElementById("fileInput")
	const resultContainer = document.getElementById("resultContainer")
	const uploadBox = document.getElementById("uploadBox")
	const analyzeBtn = document.getElementById("analyzeBtn")

	// State variables
	let selectedFile = null
	let isUploading = false
	let hasUploaded = false
	let scanningAnimationId = null

	/**
	 * Displays a preview of the selected file
	 * @param {File} file - The file to preview
	 */
	function displayFilePreview(file) {
		const reader = new FileReader()
		reader.onload = function (e) {
			// Hide the upload box
			uploadBox.style.display = "none"

			// Create and insert the image preview container
			const imageContainer = document.createElement("div")
			imageContainer.id = "imageContainer"
			imageContainer.className = "w-full max-w-md mx-auto mb-4 relative"
			imageContainer.innerHTML = `
				<img src="${e.target.result}" alt="Preview" class="w-full h-auto object-contain">
			`
			document.getElementById("messageContainer").after(imageContainer)

			// Start the scanning animation after the image is loaded
			startScanningAnimation()
		}
		reader.readAsDataURL(file)
	}

	/**
	 * Handles file selection
	 * @param {File} file - The selected file
	 */
	function handleFileSelect(file) {
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				displayError("File size exceeds 5MB limit. Please choose a smaller file.")
				return
			}
			selectedFile = file
			displayFilePreview(file)
			// Only call analyzePhoto after displayFilePreview
			setTimeout(analyzePhoto, 0)
		}
	}

	/**
	 * Handles drag and drop events
	 * @param {Event} e - The drag event
	 */
	function handleDragDrop(e) {
		e.preventDefault()
		e.stopPropagation()

		if (e.type === "dragover") {
			uploadBox.classList.add("border-blue-500")
		} else if (e.type === "dragleave") {
			uploadBox.classList.remove("border-blue-500")
		} else if (e.type === "drop") {
			uploadBox.classList.remove("border-blue-500")
			const file = e.dataTransfer.files[0]
			handleFileSelect(file)
		}
	}

	/**
	 * Analyzes the selected photo
	 */
	async function analyzePhoto() {
		if (!selectedFile || isUploading || hasUploaded) {
			return
		}

		isUploading = true
		console.log(`analyzePhoto function called`, new Date().toISOString())

		try {
			console.log("Creating FormData")
			const formData = new FormData()
			formData.append("image", selectedFile, selectedFile.name)

			console.log("Displaying loading message")
			displayLoading()

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

			hasUploaded = true

			disableUploadButtons()
		} catch (error) {
			console.error("Error in analyzePhoto:", error.message)
			stopScanningAnimation()
			displayError("Error processing image. Please try again.")
		} finally {
			isUploading = false
			console.log(`analyzePhoto function completed`, new Date().toISOString())
			// Clear the loading message
			document.getElementById("messageContainer").innerHTML = ""
		}
	}

	/**
	 * Disables upload buttons after successful upload
	 */
	function disableUploadButtons() {
		fileInput.disabled = true
	}

	/**
	 * Starts the scanning animation
	 */
	function startScanningAnimation() {
		const imageContainer = document.getElementById("imageContainer")
		if (!imageContainer) {
			console.error("Image container not found")
			return
		}

		// Remove any existing scan line
		const existingScanLine = document.getElementById("scanLine")
		if (existingScanLine) {
			existingScanLine.remove()
		}

		const scanLine = document.createElement("div")
		scanLine.id = "scanLine"
		scanLine.style.position = "absolute"
		scanLine.style.left = "0"
		scanLine.style.right = "0"
		scanLine.style.height = "4px"
		scanLine.style.backgroundColor = "rgba(0, 255, 0, 0.7)"
		scanLine.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.7)"
		scanLine.style.top = "0"

		imageContainer.style.position = "relative"
		imageContainer.appendChild(scanLine)

		let goingDown = true
		const animate = () => {
			const containerHeight = imageContainer.offsetHeight
			const scanLineHeight = scanLine.offsetHeight
			const currentTop = parseInt(scanLine.style.top, 10) || 0

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

	/**
	 * Stops the scanning animation
	 */
	function stopScanningAnimation() {
		if (scanningAnimationId) {
			cancelAnimationFrame(scanningAnimationId)
			scanningAnimationId = null
		}
		const scanLine = document.getElementById("scanLine")
		if (scanLine) {
			scanLine.remove()
		}
		const imageContainer = document.getElementById("imageContainer")
		if (imageContainer) {
			imageContainer.style.position = ""
		}
	}

	/**
	 * Displays the analysis results
	 * @param {Object} results - The analysis results
	 */
	function displayResults(results) {
		let resultsHTML = ""

		// Add "New Analysis" button
		resultsHTML += `
			<button id="newAnalysisBtn" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 mb-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
				New Analysis
			</button>
		`

		// Create results container
		resultsHTML += '<div class="bg-white shadow-lg rounded-lg overflow-hidden">'
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

		resultsHTML += "</div>"
		resultsHTML += "</div>"

		resultContainer.innerHTML = resultsHTML

		// Add event listener to the "New Analysis" button
		document.getElementById("newAnalysisBtn").addEventListener("click", () => {
			location.reload()
		})
	}

	/**
	 * Formats the property name for display
	 * @param {string} property - The property name to format
	 * @returns {string} The formatted property name
	 */
	function formatPropertyName(property) {
		return property
			.split(/(?=[A-Z])/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	}

	/**
	 * Displays an error message
	 * @param {string} message - The error message to display
	 */
	function displayError(message) {
		document.getElementById("messageContainer").innerHTML = `
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

	/**
	 * Displays a loading message with a progress bar
	 */
	function displayLoading() {
		const messageContainer = document.getElementById("messageContainer")
		messageContainer.innerHTML = `
			<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded" role="alert">
				<div class="flex items-center mb-2">
					<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p>Analyzing image...</p>
				</div>
				<div class="w-full bg-blue-200 rounded-full h-2.5">
					<div id="progressBar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
				</div>
				<p class="text-sm mt-2">This may take up to 60 seconds. Please be patient.</p>
			</div>
		`

		// Simulate progress
		let progress = 0
		const interval = setInterval(() => {
			progress += 1
			const progressBar = document.getElementById("progressBar")
			if (progressBar) {
				progressBar.style.width = `${Math.min(progress, 100)}%`
			}
			if (progress >= 100) {
				clearInterval(interval)
			}
		}, 600) // 60 seconds / 100 steps = 600ms per step
	}

	// Event listeners
	uploadBox.addEventListener("dragover", handleDragDrop)
	uploadBox.addEventListener("dragleave", handleDragDrop)
	uploadBox.addEventListener("drop", handleDragDrop)

	uploadBox.addEventListener("click", () => {
		fileInput.click()
	})

	fileInput.addEventListener("change", (e) => {
		handleFileSelect(e.target.files[0])
	})
})()
