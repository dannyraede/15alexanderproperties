import { uploadImage } from './upload.mjs';
import { analyzeImage } from './inference/prompthandler.mjs';
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Handler function called');
  console.log('Request method:', req.method);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Starting image processing');

    // Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    // Step 1: Upload the image
    console.log('Step 1: Uploading image');
    const { imageUrl } = await uploadImage(req);
    console.log('Image uploaded successfully. URL:', imageUrl);

    // Step 2: Get the full URL
    console.log('Step 2: Generating full image URL');
    const fullImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${imageUrl}`;
    console.log('Full image URL:', fullImageUrl);

    // Step 3: Analyze the image
    console.log('Step 3: Analyzing image');
    const analysisResults = await analyzeImage(fullImageUrl);
    console.log('Image analysis completed');
    console.log('Analysis results:', JSON.stringify(analysisResults, null, 2));

    // Step 4: Process and format the results
    console.log('Step 4: Formatting results');
    const formattedResults = {
      imageUrl: fullImageUrl,
      cotAnalysis: analysisResults.cotAnalysis,
      determination: analysisResults.determination,
      deepAnalysis: analysisResults.deepAnalysis,
    };
    console.log('Formatted results:', JSON.stringify(formattedResults, null, 2));

    // Step 5: Return the formatted results
    console.log('Step 5: Sending response');
    res.status(200).json(formattedResults);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Orchestration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ error: 'Processing failed', details: error.message });
    console.log('Error response sent');
  }
}
