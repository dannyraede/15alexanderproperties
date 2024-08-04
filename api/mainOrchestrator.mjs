import { uploadImage } from './upload.mjs';
import { analyzeImage } from './inference/prompthandler.mjs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Step 1: Upload the image
    const { imageUrl } = await uploadImage(req);

    // Step 2: Get the full URL
    const fullImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${imageUrl}`;

    // Step 3: Analyze the image
    const analysisResults = await analyzeImage(fullImageUrl);

    // Step 4: Process and format the results
    const formattedResults = {
      imageUrl: fullImageUrl,
      cotAnalysis: analysisResults.cotAnalysis,
      determination: analysisResults.determination,
      deepAnalysis: analysisResults.deepAnalysis,
    };

    // Step 5: Return the formatted results
    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
}
