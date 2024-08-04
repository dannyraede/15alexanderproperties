import generateCOTAnalysis from './1-COT.mjs';
import generateDetermination from './2-determination.mjs';
import generateDeepAnalysis from './3-deepAnalysis.mjs';

async function analyzeImage(imageUrl) {
  try {
    // Step 1: Generate COT Analysis
    const cotAnalysis = await generateCOTAnalysis(imageUrl);

    // Step 2: Generate Determination
    const determination = await generateDetermination(imageUrl, cotAnalysis);

    // Step 3: Generate Deep Analysis
    const deepAnalysis = await generateDeepAnalysis(imageUrl, determination);

    // Combine results
    const result = {
      cotAnalysis,
      determination,
      deepAnalysis,
    };

    return result;
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw error;
  }
}

export { analyzeImage };
