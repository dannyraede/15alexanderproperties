import generateCOTAnalysis from "./1-COT.mjs"
import generateDetermination from "./2-determination.mjs"
import generateDeepAnalysis from "./3-deepAnalysis.mjs"

async function analyzeImage(imageUrl) {
	console.log("Starting analyzeImage function")
	try {
		// Step 1: Generate COT Analysis
		console.log("Step 1: Generating COT Analysis")
		const cotAnalysis = await generateCOTAnalysis(imageUrl)
		console.log("COT Analysis generated successfully")

		// Step 2: Generate Determination
		console.log("Step 2: Generating Determination")
		const determination = await generateDetermination(imageUrl, cotAnalysis)
		console.log("Determination generated successfully")

		// Step 3: Generate Deep Analysis
		console.log("Step 3: Generating Deep Analysis")
		const deepAnalysis = await generateDeepAnalysis(imageUrl, determination)
		console.log("Deep Analysis generated successfully")

		// Combine results
		console.log("Combining results")
		const result = {
			cotAnalysis,
			determination,
			deepAnalysis,
		}

		console.log("Analysis completed successfully")
		return result
	} catch (error) {
		console.error("Error in analyzeImage:")
		console.error("Error message:", error.message)
		throw error
	}
}

export { analyzeImage }
