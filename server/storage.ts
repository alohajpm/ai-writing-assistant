import { surveyResponses, type SurveyResponse, type InsertSurveyResponse } from "@shared/schema";

export interface IStorage {
  getSurveyResponse(sessionId: string): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  updateSurveyResponse(sessionId: string, updates: Partial<SurveyResponse>): Promise<SurveyResponse | undefined>;
  deleteSurveyResponse(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private responses: Map<string, SurveyResponse>;
  private currentId: number;

  constructor() {
    this.responses = new Map();
    this.currentId = 1;
  }

  async getSurveyResponse(sessionId: string): Promise<SurveyResponse | undefined> {
    return Array.from(this.responses.values()).find(
      (response) => response.sessionId === sessionId
    );
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = this.currentId++;
    const response: SurveyResponse = {
      ...insertResponse,
      id,
      completedAt: new Date().toISOString()
    };
    this.responses.set(response.sessionId, response);
    return response;
  }

  async updateSurveyResponse(sessionId: string, updates: Partial<SurveyResponse>): Promise<SurveyResponse | undefined> {
    const existing = await this.getSurveyResponse(sessionId);
    if (!existing) {
      return undefined;
    }

    const updated: SurveyResponse = {
      ...existing,
      ...updates,
      id: existing.id,
      sessionId: existing.sessionId,
      completedAt: new Date().toISOString()
    };

    this.responses.set(sessionId, updated);
    return updated;
  }

  async deleteSurveyResponse(sessionId: string): Promise<boolean> {
    const existing = await this.getSurveyResponse(sessionId);
    if (!existing) {
      return false;
    }
    this.responses.delete(sessionId);
    return true;
  }
}

export const storage = new MemStorage();
