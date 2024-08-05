# Building Pattern Recognition App

## Overview

This application uses AI to analyze photographs of buildings and identify the presence of Christopher Alexander's 15 fundamental patterns. It provides a web-based interface for capturing or uploading images, which are then processed using advanced AI models to recognize architectural patterns.

## Purpose

The purpose of this project is to make architectural pattern recognition accessible to everyone. Whether you're an architect, a student, or simply someone interested in the built environment, this tool can help you understand and appreciate the fundamental patterns that contribute to wholesome and life-affirming spaces.

## Features

- Live camera feed for real-time building capture
- Photo upload functionality
- AI-powered analysis of 15 fundamental architectural patterns
- Detailed results display with explanations

## Technical Stack

- Frontend: HTML5, vanilla JavaScript, Tailwind CSS
- Backend: Node.js-based API
- Hosting: Vercel
- AI/ML: OpenAI API
- Storage: Vercel Blob Storage

## Deployment

This project is designed to be hosted on Vercel. To deploy your own instance:

1. Fork this repository
2. Sign up for a Vercel account if you haven't already
3. Create a new project in Vercel and link it to your forked repository
4. Set up the following environment variable in your Vercel project settings:
   - `OPENAI_API_KEY`: Your OpenAI API key

## Local Development

To run this project locally:

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file in the root directory and add your OpenAI API key: OPENAI_API_KEY=your_api_key_here
4. Run the development server with `npm run dev`

## Contributing

Please fork this if you wish to contribute. I dont intend to add new features to this currently.

## Future Enhancements

- None planned. Frankly I am very buusy and this is a prototype.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

This project is inspired by the work of Christopher Alexander and his book series "The Nature of Order", as well as a quote from Nikos Salingaros: "At the time of writing, using large language models to evaluate the 15 properties hidden in an image is not very accurate."

Note: This entire project, including this readme, the definitions of the patterns and all the code was written by Anthropic Claude 3.5 sonnet, so thanks to Anthropic for making such a great model, and to cursor for the IDE.

## Contact

For more information or to get in touch, you can contact me on Twitter [@dannyraede](https://twitter.com/dannyraede) or visit my website [dannyraede.com](https://dannyraede.com).
