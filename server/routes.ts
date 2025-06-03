import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertSurveyResponseSchema, surveyResponseUpdateSchema, surveyDataSchema } from "@shared/schema";
import { aiService } from "./ai-service";

// Import the prompt generation functions
function generateWritingPrompt(surveyData: any): string {
  const formalityLabels = ['Very Casual', 'Casual', 'Moderate', 'Formal', 'Very Formal'];
  const paceLabels = ['Very Slow', 'Slow', 'Moderate', 'Fast', 'Very Fast'];
  const jargonLabels = ['None', 'Minimal', 'Moderate', 'Frequent', 'Heavy'];
  const warmthLabels = ['Very Direct', 'Direct', 'Balanced', 'Warm', 'Very Warm'];
  const directnessLabels = ['Very Indirect', 'Indirect', 'Balanced', 'Direct', 'Very Direct'];
  const authorityLabels = ['Very Humble', 'Humble', 'Balanced', 'Confident', 'Very Confident'];

  const prompt = `# AI Writing Style Guide for Diamond Consultants

## Core Writing Instructions

You are writing for Diamond Consultants, a premier executive recruiting firm. Your writing should reflect the following personalized style preferences:

### 1. **Overall Formality Level**
- **Setting:** ${formalityLabels[surveyData.overallFormality - 1]} (${surveyData.overallFormality}/5)
- **Application:** ${surveyData.overallFormality <= 2 ? 'Use conversational language, contractions, and approachable tone' : surveyData.overallFormality === 3 ? 'Balance professional language with accessible communication' : 'Maintain formal language, proper grammar, and professional tone throughout'}

### 2. **Content Pace & Density**
- **Setting:** ${paceLabels[surveyData.contentPace - 1]} (${surveyData.contentPace}/5)
- **Application:** ${surveyData.contentPace <= 2 ? 'Take time to explain concepts thoroughly, use detailed examples, and provide comprehensive context' : surveyData.contentPace === 3 ? 'Balance detail with efficiency, include necessary context without over-explaining' : 'Get to the point quickly, use concise language, and focus on key information'}

### 3. **Industry Jargon Usage**
- **Setting:** ${jargonLabels[surveyData.industryJargon - 1]} (${surveyData.industryJargon}/5)
- **Application:** ${surveyData.industryJargon <= 2 ? 'Avoid technical terms, explain any necessary industry concepts in plain language' : surveyData.industryJargon === 3 ? 'Use industry terms when appropriate but ensure clarity for broader audiences' : 'Freely use relevant industry terminology and assume familiarity with recruiting/business concepts'}

### 4. **Warmth & Empathy**
- **Setting:** ${warmthLabels[surveyData.warmthEmpathy - 1]} (${surveyData.warmthEmpathy}/5)
- **Application:** ${surveyData.warmthEmpathy <= 2 ? 'Focus on facts and outcomes with minimal emotional language' : surveyData.warmthEmpathy === 3 ? 'Include appropriate personal touches while maintaining professionalism' : 'Show genuine care for recipients, acknowledge challenges, and use empathetic language'}

### 5. **Directness Level**
- **Setting:** ${directnessLabels[surveyData.directness - 1]} (${surveyData.directness}/5)
- **Application:** ${surveyData.directness <= 2 ? 'Use diplomatic language, soften requests with context, and approach topics gently' : surveyData.directness === 3 ? 'Be clear about expectations while remaining tactful' : 'State requirements and expectations clearly and directly'}

### 6. **Authority & Confidence**
- **Setting:** ${authorityLabels[surveyData.authorityBalance - 1]} (${surveyData.authorityBalance}/5)
- **Application:** ${surveyData.authorityBalance <= 2 ? 'Use collaborative language, acknowledge limitations, and invite input from others' : surveyData.authorityBalance === 3 ? 'Balance expertise with openness to feedback' : 'Position yourself as the expert, provide definitive guidance, and demonstrate deep knowledge'}

## Content Structure Requirements

${surveyData.structuralElements && surveyData.structuralElements.length > 0 ? 
  `Always include these structural elements:\n${surveyData.structuralElements.map((element: string) => `- ${element}`).join('\n')}` : 
  'Use clear, logical structure appropriate to the content type'}

## Call-to-Action Style

${surveyData.ctaStyle === 'direct' ? 'Use direct, clear calls-to-action that specify exactly what you want the recipient to do and when' :
  surveyData.ctaStyle === 'benefit' ? 'Frame calls-to-action around benefits to the recipient, showing value before making requests' :
  surveyData.ctaStyle === 'soft' ? 'Use gentle, non-pressure language that invites rather than demands action' :
  'Provide clear next steps while maintaining a professional, collaborative tone'}

## Target Audience Context

**Primary Audience:** ${surveyData.companyAudienceContext}
**Industry Focus:** ${surveyData.companyIndustry}

## Professional Excellence

Maintain the high standards expected from Diamond Consultants' communications while staying true to this personalized style profile. The goal is to create a distinctive, professional voice that resonates with your specific audience while maintaining Diamond Consultants' reputation for excellence.`;

  return prompt;
}

function generateSampleEmail(surveyData: any): string {
  const formalityLevel = surveyData.overallFormality;
  const warmthLevel = surveyData.warmthEmpathy;
  const directnessLevel = surveyData.directness;
  
  let greeting = "";
  let content = "";
  let closing = "";
  
  // Adjust greeting based on formality
  if (formalityLevel <= 2) {
    greeting = "Hi Sarah,";
  } else if (formalityLevel === 3) {
    greeting = "Hello Sarah,";
  } else {
    greeting = "Dear Sarah,";
  }
  
  // Adjust content based on warmth and directness
  if (warmthLevel >= 4 && directnessLevel <= 3) {
    content = `I hope this email finds you well. I'm excited to introduce you to an exceptional candidate who I believe would be a perfect fit for your Chief Technology Officer position.

Meet Michael Chen, a visionary technology leader with over 15 years of experience scaling engineering teams at high-growth companies. His track record includes leading digital transformation initiatives that resulted in 40% revenue growth and building world-class engineering organizations from the ground up.

What makes Michael particularly compelling for your role:
• Successfully scaled engineering teams from 20 to 200+ engineers
• Led the architecture and implementation of cloud-native platforms serving millions of users
• Deep expertise in AI/ML implementation and data-driven decision making
• Proven ability to align technical strategy with business objectives

Michael is currently exploring new opportunities and would be thrilled to discuss how he can contribute to your company's continued growth. His leadership style focuses on building collaborative, high-performing teams while maintaining technical excellence.`;
  } else if (directnessLevel >= 4) {
    content = `I'm writing to introduce Michael Chen for your Chief Technology Officer position. His qualifications directly align with your requirements.

Key credentials:
• 15+ years technology leadership experience
• Successfully scaled engineering teams from 20 to 200+ engineers
• Led digital transformation initiatives resulting in 40% revenue growth
• Deep expertise in cloud architecture, AI/ML, and platform development
• Proven track record building high-performing engineering organizations

Michael is actively seeking his next leadership role and is specifically interested in your CTO opportunity. He's available for an interview at your convenience.`;
  } else {
    content = `I wanted to reach out regarding your Chief Technology Officer search. I have an outstanding candidate who I believe merits your consideration.

Michael Chen brings over 15 years of technology leadership experience, with particular strength in scaling engineering organizations and driving technical innovation. During his tenure at his current company, he's led initiatives that directly contributed to significant business growth and operational efficiency.

His background includes expertise in cloud architecture, artificial intelligence implementation, and building collaborative engineering cultures. Michael has consistently demonstrated the ability to translate complex technical concepts into business value.

I believe his experience and leadership approach would be valuable for your organization. He's expressed strong interest in learning more about your CTO opportunity.`;
  }
  
  // Adjust closing based on formality and CTA style
  if (surveyData.ctaStyle === "direct") {
    closing = "Please let me know when you'd like to schedule a conversation with Michael. I can coordinate calendars and provide his full portfolio.";
  } else if (surveyData.ctaStyle === "benefit") {
    closing = "I'd be happy to arrange an introduction so you can learn more about how Michael's experience could benefit your technical roadmap.";
  } else if (surveyData.ctaStyle === "soft") {
    closing = "Would you be interested in learning more about Michael's background? I'm happy to share additional details or arrange an introduction.";
  } else {
    closing = "Michael's full portfolio is available upon request. Feel free to reach out with any questions.";
  }
  
  let signature = "";
  if (formalityLevel <= 2) {
    signature = "\nBest,\nAlex Thompson\nDiamond Consultants";
  } else if (formalityLevel === 3) {
    signature = "\nBest regards,\nAlex Thompson\nSenior Partner\nDiamond Consultants";
  } else {
    signature = "\nSincerely,\nAlex Thompson\nSenior Partner\nDiamond Consultants\n(555) 123-4567\nalex.thompson@diamondconsultants.com";
  }
  
  return `${greeting}\n\n${content}\n\n${closing}${signature}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get survey response by session ID
  app.get("/api/survey/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const response = await storage.getSurveyResponse(sessionId);
      
      if (!response) {
        return res.status(404).json({ message: "Survey response not found" });
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching survey response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new survey response
  app.post("/api/survey", async (req, res) => {
    try {
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      
      // Check if session already exists
      const existing = await storage.getSurveyResponse(validatedData.sessionId);
      if (existing) {
        return res.status(409).json({ message: "Survey response already exists for this session" });
      }
      
      const response = await storage.createSurveyResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating survey response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update existing survey response
  app.put("/api/survey/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const validatedData = surveyResponseUpdateSchema.parse(req.body);
      
      const response = await storage.updateSurveyResponse(sessionId, validatedData);
      
      if (!response) {
        return res.status(404).json({ message: "Survey response not found" });
      }
      
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating survey response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete survey response
  app.delete("/api/survey/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const deleted = await storage.deleteSurveyResponse(sessionId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Survey response not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting survey response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Export survey response as JSON
  app.get("/api/survey/:sessionId/export", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const response = await storage.getSurveyResponse(sessionId);
      
      if (!response) {
        return res.status(404).json({ message: "Survey response not found" });
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ai-writing-preferences-${sessionId}.json"`);
      res.json(response);
    } catch (error) {
      console.error("Error exporting survey response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Preview endpoint
  app.post("/api/ai/preview", async (req, res) => {
    try {
      const previewSchema = z.object({
        content: z.string().min(1, "Content is required"),
        surveyData: surveyDataSchema
      });

      const { content, surveyData } = previewSchema.parse(req.body);
      
      const preview = await aiService.generatePreview({ content, surveyData });
      res.json(preview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error generating AI preview:", error);
      res.status(500).json({ message: "Failed to generate preview" });
    }
  });

  // Style Analysis endpoint
  app.post("/api/ai/analyze-style", async (req, res) => {
    try {
      const styleSchema = z.object({
        samples: z.array(z.object({
          title: z.string(),
          content: z.string()
        })).min(1, "At least one writing sample is required")
      });

      const { samples } = styleSchema.parse(req.body);
      
      const analysis = await aiService.analyzeWritingStyle({ samples });
      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error analyzing writing style:", error);
      res.status(500).json({ message: "Failed to analyze writing style" });
    }
  });

  // Generate Prompt endpoint
  app.post("/api/ai/generate-prompt", async (req, res) => {
    try {
      const generateSchema = z.object({
        surveyData: surveyDataSchema,
        sessionId: z.string()
      });

      const { surveyData, sessionId } = generateSchema.parse(req.body);
      
      // Generate the custom writing prompt based on survey data
      const prompt = generateWritingPrompt(surveyData);
      
      // Generate a sample writing piece based on the survey preferences
      const sampleWriting = generateSampleEmail(surveyData);

      res.json({
        prompt,
        sampleWriting
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error generating prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
