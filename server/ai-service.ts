import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SurveyData } from '@shared/schema';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PreviewRequest {
  content: string;
  surveyData: SurveyData;
  generatedPrompt?: string;
}

interface PreviewResponse {
  preview: string;
}

interface WritingSample {
  title: string;
  content: string;
}

interface StyleAnalysisRequest {
  samples: WritingSample[];
}

interface StyleAnalysisResponse {
  analysis: string;
}

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async analyzeWritingStyle(request: StyleAnalysisRequest): Promise<StyleAnalysisResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { samples } = request;
    
    const prompt = this.buildStyleAnalysisPrompt(samples);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      return { analysis };
    } catch (error) {
      console.error('Error analyzing writing style:', error);
      throw new Error('Failed to analyze writing style');
    }
  }

  async generatePreview(request: PreviewRequest): Promise<PreviewResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { content, surveyData, generatedPrompt } = request;
    
    // Use the generated prompt if available, otherwise build from survey data
    let prompt: string;
    if (generatedPrompt && generatedPrompt.trim()) {
      prompt = `${generatedPrompt}\n\nNow, using the writing style preferences outlined above, rewrite the following text to match this exact style:\n\n"${content}"\n\nRewritten version:`;
    } else {
      prompt = this.buildPrompt(content, surveyData);
    }
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const preview = response.text();
      
      return { preview };
    } catch (error) {
      console.error('Error generating AI preview:', error);
      throw new Error('Failed to generate preview');
    }
  }