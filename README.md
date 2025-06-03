# AI Writing Assistant

A comprehensive AI writing assistant configuration platform that enables users to personalize their writing experience through interactive surveys, advanced writing sample analysis, and custom style generation.

## Features

- **Interactive Writing Style Survey**: Comprehensive 9-step survey to capture writing preferences
- **AI-Powered Style Analysis**: Analyze existing writing samples to understand style patterns
- **Custom Prompt Generation**: Generate personalized AI writing prompts based on survey responses
- **AI Sample Generation**: Create writing samples that match your specific style preferences
- **Real-time Preview**: Test and refine your writing style with AI-generated samples

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **AI Integration**: Google Gemini AI for writing analysis and sample generation
- **Data Validation**: Zod for type-safe data validation
- **State Management**: TanStack Query for API state management
- **Routing**: Wouter for client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alohajpm/ai-writing-assistant.git
cd ai-writing-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── api/                    # Vercel API endpoints
│   ├── ai/                # AI-related API endpoints
│   └── survey/            # Survey data endpoints
├── client/src/            # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility libraries
├── server/               # Backend server code
│   ├── ai-service.ts     # AI integration service
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Data storage interface
├── shared/               # Shared types and schemas
└── src/                  # Additional source files
```

## Usage

1. **Complete the Survey**: Navigate through the 9-step writing style survey
2. **Review Your Prompt**: View your personalized AI writing prompt
3. **Generate Samples**: Use the "Generate Sample" button to create AI-powered writing samples
4. **Refine and Download**: Copy or download your custom prompt for use with AI tools

## API Endpoints

- `POST /api/ai/generate-prompt` - Generate custom writing prompt from survey data
- `POST /api/ai/preview` - Generate AI writing samples using custom prompts
- `POST /api/ai/analyze-style` - Analyze writing samples for style patterns
- `GET/POST /api/survey/[sessionId]` - Manage survey session data

## Security

- Updated dependencies for security compliance
- Environment variable protection for API keys
- Input validation and sanitization
- CORS protection for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Google Gemini AI for advanced language processing
- UI components powered by shadcn/ui and Radix UI
- Styling with Tailwind CSS

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.