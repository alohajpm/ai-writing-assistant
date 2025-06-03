import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  tone: text("tone").notNull(),
  sentenceLength: integer("sentence_length").notNull().default(3),
  vocabulary: integer("vocabulary").notNull().default(3),
  formality: integer("formality").notNull().default(3),
  examples: integer("examples").notNull().default(3),
  audiences: jsonb("audiences").$type<string[]>().notNull().default([]),
  contentTypes: jsonb("content_types").$type<string[]>().notNull().default([]),
  personality: jsonb("personality").$type<string[]>().notNull().default([]),
  useBulletPoints: boolean("use_bullet_points").notNull().default(false),
  useHeaders: boolean("use_headers").notNull().default(false),
  useCTA: boolean("use_cta").notNull().default(false),
  industry: text("industry"),
  customInstructions: text("custom_instructions"),
  audienceContext: text("audience_context"),
  completedAt: text("completed_at").notNull()
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  completedAt: true
});

export const surveyResponseUpdateSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  sessionId: true,
  completedAt: true
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type UpdateSurveyResponse = z.infer<typeof surveyResponseUpdateSchema>;

// Survey data structure matching Kelly's comprehensive form
export const surveyDataSchema = z.object({
  // Core style preferences (6 main scales from Kelly's form)
  overallFormality: z.number().min(1).max(5).default(3), // Informal & Casual to Very Formal & Professional
  contentPace: z.number().min(1).max(5).default(3), // Quick & Skimmable to Detailed & Thorough
  industryJargon: z.number().min(1).max(5).default(3), // Avoid Jargon to Use Freely
  warmthEmpathy: z.number().min(1).max(5).default(3), // Purely Objective to Warm & Empathetic
  directness: z.number().min(1).max(5).default(3), // Subtle & Indirect to Clear & Explicit
  authorityBalance: z.number().min(1).max(5).default(3), // Primarily Authoritative to Primarily Relatable
  
  // Structural elements (checkboxes from Kelly's form)
  structuralElements: z.array(z.string()).default([]),
  
  // Call to action style (radio buttons from Kelly's form)
  ctaStyle: z.string().default(""),
  
  // Writing samples
  writingSamples: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    type: z.string(), // email, linkedin, article
    purpose: z.string().optional()
  })).default([]),
  
  // Company standard fields (set by marketing team)
  companyAudienceContext: z.string().default("Senior executives and business leaders in technology companies"),
  companyIndustry: z.string().default("Executive recruiting and talent acquisition"),
  
  // Generated content
  styleAnalysis: z.string().optional(),
  generatedPrompt: z.string().optional(),
  sampleWriting: z.string().optional()
});

export type SurveyData = z.infer<typeof surveyDataSchema>;
