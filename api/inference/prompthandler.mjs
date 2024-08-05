// Import necessary functions from other modules
import generateCOTAnalysis from "./1-COT.mjs"
import generateDetermination from "./2-determination.mjs"
import generateDeepAnalysis from "./3-deepAnalysis.mjs"

/**
 * Analyzes an image using a three-step process: Chain of Thought (COT) Analysis,
 * Determination, and Deep Analysis.
 * 
 * @param {string} imageUrl - The URL of the image to be analyzed.
 * @returns {Promise<Object>} An object containing the deep analysis results.
 * @throws {Error} If any step of the analysis process fails.
 */
async function analyzeImage(imageUrl) {
	console.log("Starting analyzeImage function")
	try {
		// Step 1: Generate Chain of Thought (COT) Analysis
		console.log("Step 1: Generating COT Analysis")
		const cotAnalysis = await generateCOTAnalysis(imageUrl)
		console.log("COT Analysis generated successfully")

		// Step 2: Generate Determination based on COT Analysis
		console.log("Step 2: Generating Determination")
		const determination = await generateDetermination(imageUrl, cotAnalysis)
		console.log("Determination generated successfully")

		// Step 3: Generate Deep Analysis based on Determination
		console.log("Step 3: Generating Deep Analysis")
		const deepAnalysis = await generateDeepAnalysis(imageUrl, determination)
		console.log("Deep Analysis generated successfully")

		console.log("Analysis completed successfully")
		return { deepAnalysis }
	} catch (error) {
		// Log any errors that occur during the analysis process
		console.error("Error in analyzeImage:")
		console.error("Error message:", error.message)
		// Re-throw the error to be handled by the caller
		throw error
	}
}

// Export the analyzeImage function for use in other modules
export { analyzeImage }
