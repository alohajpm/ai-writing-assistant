import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Download, Copy, Wand2, Loader2 } from "lucide-react";
import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { motion, AnimatePresence } from "framer-motion";
import type { SurveyData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const TOTAL_STEPS = 9;

const initialSurveyData: SurveyData = {
  overallFormality: 3,
  contentPace: 3,
  industryJargon: 3,
  warmthEmpathy: 3,
  directness: 3,
  authorityBalance: 3,
  structuralElements: [],
  ctaStyle: '',
  writingSamples: [],
  companyAudienceContext: 'Senior executives and business leaders in technology companies',
  companyIndustry: 'Executive recruiting and talent acquisition'
};

export default function ComprehensiveSurvey() {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>(initialSurveyData);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const updateSurveyData = (updates: Partial<SurveyData>) => {
    setSurveyData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePromptMutation = useMutation({
    mutationFn: async (data: SurveyData) => {
      console.log('Starting API call with data:', data);
      const response = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ surveyData: data, sessionId })
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }
      
      const result = await response.json();
      console.log('API Response data:', result);
      
      // Validate the response structure
      if (!result.prompt || !result.sampleWriting) {
        console.error('Invalid API response structure:', result);
        throw new Error('Invalid response format');
      }
      
      return result;
    },
    onSuccess: (response) => {
      console.log('onSuccess triggered with:', response);
      
      // Update the survey data with prompt only (no sample yet)
      setSurveyData(prev => ({
        ...prev,
        generatedPrompt: response.prompt
      }));
      
      // Then change step
      console.log('Setting step to 10');
      setCurrentStep(10);
    },
    onError: (error) => {
      console.error('Generation failed:', error);
    }
  });

  const generateSampleMutation = useMutation({
    mutationFn: async () => {
      const sampleContent = "I hope this email finds you well. I wanted to reach out regarding an exciting leadership opportunity that perfectly aligns with your expertise and career trajectory.";
      
      const response = await fetch('/api/ai/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: sampleContent,
          surveyData: surveyData,
          generatedPrompt: surveyData.generatedPrompt
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate sample');
      }
      
      const result = await response.json();
      return result.preview;
    },
    onSuccess: (generatedSample) => {
      setSurveyData(prev => ({
        ...prev,
        sampleWriting: generatedSample
      }));
    },
    onError: (error) => {
      console.error('Error generating sample:', error);
    }
  });

  const handleFinish = () => {
    generatePromptMutation.mutate(surveyData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPrompt = () => {
    if (surveyData.generatedPrompt) {
      const blob = new Blob([surveyData.generatedPrompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `writing-style-prompt-${sessionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-900 text-center">
                Welcome to Your AI Writing Assistant Setup
              </CardTitle>
              <p className="text-gray-600 text-lg text-center">
                This comprehensive survey will help us understand your unique writing style and preferences to create a personalized AI writing assistant for Diamond Consultants.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">What we'll cover:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Your communication style preferences (6 key dimensions)</li>
                  <li>• Structural elements you prefer in your writing</li>
                  <li>• Call-to-action styles that feel natural to you</li>
                  <li>• Your writing samples for personalization</li>
                </ul>
              </div>
              <Button onClick={nextStep} className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Overall Formality
              </CardTitle>
              <p className="text-gray-600">
                How formal or informal do you want your writing style to be? Please indicate your preference on the scale below.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Informal & Casual</span>
                  <span>Very Formal & Professional</span>
                </div>
                <Slider
                  value={[surveyData.overallFormality]}
                  onValueChange={(value) => updateSurveyData({ overallFormality: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.overallFormality}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Content Pace & Density
              </CardTitle>
              <p className="text-gray-600">
                How would you like the information you are trying to convey to be presented in terms of pacing and density?
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 text-center">
                  <div>
                    <div>Quick & Skimmable</div>
                    <div className="text-xs mt-1">(Short sentences, brief paragraphs, easy to digest quickly)</div>
                  </div>
                  <div>
                    <div>Detailed & Thorough</div>
                    <div className="text-xs mt-1">(More comprehensive explanations, developed points)</div>
                  </div>
                </div>
                <Slider
                  value={[surveyData.contentPace]}
                  onValueChange={(value) => updateSurveyData({ contentPace: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.contentPace}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Use of Industry Jargon
              </CardTitle>
              <p className="text-gray-600">
                To what extent do you usually use industry-specific terminology or jargon in social posts or emails?
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 text-center">
                  <div>
                    <div>Avoid Jargon Entirely</div>
                    <div className="text-xs mt-1">(Plain language, easily understood by a broad audience)</div>
                  </div>
                  <div>
                    <div>Use Freely</div>
                    <div className="text-xs mt-1">(Most suitable for experienced peers)</div>
                  </div>
                </div>
                <Slider
                  value={[surveyData.industryJargon]}
                  onValueChange={(value) => updateSurveyData({ industryJargon: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.industryJargon}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Tone: Warmth & Empathy
              </CardTitle>
              <p className="text-gray-600">
                How much warmth and empathy do you want to convey in your communications?
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Purely Objective & Factual</span>
                  <span>Warm, Encouraging & Empathetic</span>
                </div>
                <Slider
                  value={[surveyData.warmthEmpathy]}
                  onValueChange={(value) => updateSurveyData({ warmthEmpathy: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.warmthEmpathy}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Approach: Directness of Communication
              </CardTitle>
              <p className="text-gray-600">
                How direct or indirect are you usually when providing information, advice, or calls to action?
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtle & Indirect (Implies or suggests)</span>
                  <span>Clear & Explicit (States information plainly)</span>
                </div>
                <Slider
                  value={[surveyData.directness]}
                  onValueChange={(value) => updateSurveyData({ directness: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.directness}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Balancing Authority with Approachability
              </CardTitle>
              <p className="text-gray-600">
                How do you normally balance sounding authoritative versus approachable when speaking with a candidate?
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 text-center">
                  <div>
                    <div>Primarily Authoritative & Expert</div>
                    <div className="text-xs mt-1">(Emphasizes knowledge and expertise)</div>
                  </div>
                  <div>
                    <div>Primarily Relatable & Peer-Like</div>
                    <div className="text-xs mt-1">(Emphasizes connection and shared understanding)</div>
                  </div>
                </div>
                <Slider
                  value={[surveyData.authorityBalance]}
                  onValueChange={(value) => updateSurveyData({ authorityBalance: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{surveyData.authorityBalance}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        const structuralOptions = [
          "Short paragraphs",
          "Bullet points or numbered lists",
          "Subheadings to break up text",
          "Bold text for emphasis on key phrases",
          "Occasional emojis for tone/rhythm (if appropriate for formality)",
          "\"Case for / Case against\" or \"Pros / Cons\" structure for analysis"
        ];

        const ctaOptions = [
          { value: "soft", label: "Soft & Inviting", description: "Encourages action without pressure (e.g., \"Would you like to learn more?\")." },
          { value: "direct", label: "Clear & Direct", description: "Explicitly states the desired action (e.g., \"Click here to proceed.\")." },
          { value: "benefit", label: "Benefit-Oriented", description: "Highlights the value of taking the action (e.g., \"Sign up now to get X benefit.\")." },
          { value: "minimal", label: "Minimal/Contextual", description: "CTAs should be infrequent or very subtly integrated." }
        ];

        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Structural Preferences
              </CardTitle>
              <p className="text-gray-600">
                Please indicate your preferences for structural elements and call-to-action styles.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Preferred Structural Elements</h3>
                  <p className="text-sm text-gray-600 mb-4">Which of these structural elements do you find most effective for readability and engagement? Please check all that apply.</p>
                  <div className="space-y-3">
                    {structuralOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-3">
                        <Checkbox
                          id={option}
                          checked={surveyData.structuralElements?.includes(option) || false}
                          onCheckedChange={(checked) => {
                            const currentElements = surveyData.structuralElements || [];
                            if (checked) {
                              updateSurveyData({ 
                                structuralElements: [...currentElements, option] 
                              });
                            } else {
                              updateSurveyData({ 
                                structuralElements: currentElements.filter(e => e !== option) 
                              });
                            }
                          }}
                        />
                        <label htmlFor={option} className="text-sm cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Call to Action Style</h3>
                  <p className="text-sm text-gray-600 mb-4">What "call to action" style feels most natural to you? Please select one.</p>
                  <RadioGroup
                    value={surveyData.ctaStyle}
                    onValueChange={(value) => updateSurveyData({ ctaStyle: value })}
                  >
                    {ctaOptions.map((option) => (
                      <div key={option.value} className="flex items-start space-x-3">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 9:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Writing Samples
              </CardTitle>
              <p className="text-gray-600">
                In order to accurately train AI to speak in your voice, please provide writing samples below.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Please provide:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 10 of your best outgoing email messages (try to grab different types - introductory emails, follow-up emails, etc.)</li>
                  <li>• 10 of your best LinkedIn posts</li>
                  <li>• 10 links to Diamond Consultants articles you've written (if applicable)</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-samples">Email Samples</Label>
                  <Textarea
                    id="email-samples"
                    placeholder="Paste your email samples here..."
                    className="min-h-32"
                    value={surveyData.writingSamples?.find(s => s.type === 'email')?.content || ''}
                    onChange={(e) => {
                      const currentSamples = surveyData.writingSamples || [];
                      const otherSamples = currentSamples.filter(s => s.type !== 'email');
                      if (e.target.value) {
                        updateSurveyData({
                          writingSamples: [
                            ...otherSamples,
                            {
                              id: 'email-samples',
                              title: 'Email Samples',
                              content: e.target.value,
                              type: 'email'
                            }
                          ]
                        });
                      } else {
                        updateSurveyData({ writingSamples: otherSamples });
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="linkedin-samples">LinkedIn Posts</Label>
                  <Textarea
                    id="linkedin-samples"
                    placeholder="Paste your LinkedIn posts here..."
                    className="min-h-32"
                    value={surveyData.writingSamples?.find(s => s.type === 'linkedin')?.content || ''}
                    onChange={(e) => {
                      const currentSamples = surveyData.writingSamples || [];
                      const otherSamples = currentSamples.filter(s => s.type !== 'linkedin');
                      if (e.target.value) {
                        updateSurveyData({
                          writingSamples: [
                            ...otherSamples,
                            {
                              id: 'linkedin-samples',
                              title: 'LinkedIn Posts',
                              content: e.target.value,
                              type: 'linkedin'
                            }
                          ]
                        });
                      } else {
                        updateSurveyData({ writingSamples: otherSamples });
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="article-samples">Article Links/Content</Label>
                  <Textarea
                    id="article-samples"
                    placeholder="Paste article links or content here..."
                    className="min-h-32"
                    value={surveyData.writingSamples?.find(s => s.type === 'article')?.content || ''}
                    onChange={(e) => {
                      const currentSamples = surveyData.writingSamples || [];
                      const otherSamples = currentSamples.filter(s => s.type !== 'article');
                      if (e.target.value) {
                        updateSurveyData({
                          writingSamples: [
                            ...otherSamples,
                            {
                              id: 'article-samples',
                              title: 'Article Samples',
                              content: e.target.value,
                              type: 'article'
                            }
                          ]
                        });
                      } else {
                        updateSurveyData({ writingSamples: otherSamples });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleFinish}
                  disabled={generatePromptMutation.isPending}
                >
                  {generatePromptMutation.isPending ? 'Generating...' : 'Generate My Writing Prompt'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Your Personalized Writing Style Guide
              </CardTitle>
              <p className="text-gray-600">
                Here's your custom AI writing prompt and a sample piece generated in your style.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {surveyData.generatedPrompt && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Custom Writing Prompt</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(surveyData.generatedPrompt!)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadPrompt}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{surveyData.generatedPrompt}</pre>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI-Generated Writing Sample</h3>
                  {!surveyData.sampleWriting && (
                    <Button
                      onClick={() => generateSampleMutation.mutate()}
                      disabled={generateSampleMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {generateSampleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Sample
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {surveyData.sampleWriting ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm">{surveyData.sampleWriting}</div>
                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <Button
                        onClick={() => generateSampleMutation.mutate()}
                        disabled={generateSampleMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {generateSampleMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate New Sample
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <Wand2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click "Generate Sample" to see your writing style in action</p>
                    <p className="text-sm text-gray-500">The AI will apply your custom prompt to create a personalized writing sample</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button onClick={() => {
                  setCurrentStep(1);
                  setSurveyData(initialSurveyData);
                }}>
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <SurveyHeader />
      
      {currentStep <= TOTAL_STEPS && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {currentStep > TOTAL_STEPS && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="flex justify-center items-center">
              <span className="text-lg font-semibold text-green-600">
                🎉 Survey Complete! Your personalized writing style guide is ready.
              </span>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}