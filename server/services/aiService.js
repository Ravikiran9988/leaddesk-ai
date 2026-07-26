import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

let groqClient = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY is not configured. Add it to your server .env file.');
    error.statusCode = 503;
    throw error;
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groqClient;
};

const parseJsonResponse = (content) => {
  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const error = new Error('AI returned an invalid response. Please try again.');
    error.statusCode = 502;
    throw error;
  }
};

export const generateStructuredResponse = async (systemPrompt, userPrompt) => {
  const client = getClient();

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      const error = new Error('AI returned an empty response. Please try again.');
      error.statusCode = 502;
      throw error;
    }

    return parseJsonResponse(content);
  } catch (error) {
    if (error.statusCode) throw error;

    if (error.status === 429) {
      const rateLimitError = new Error('AI rate limit reached. Please wait a moment and try again.');
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }

    const apiError = new Error('AI service is temporarily unavailable. Please try again later.');
    apiError.statusCode = 503;
    throw apiError;
  }
};

const LEAD_ANALYSIS_SYSTEM = `You are an expert sales CRM analyst. Analyze lead data and return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence summary of the lead",
  "priority": "High" | "Medium" | "Low",
  "category": "one of: Enterprise, SMB, Startup, Individual, Other",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedDealValue": number (USD estimate based on budget range),
  "sentiment": "Positive" | "Neutral" | "Negative",
  "confidenceScore": number 0-100,
  "leadScore": number 0-100 (overall lead quality score),
  "recommendedNextAction": "specific actionable next step for sales team"
}
Be realistic with deal value estimates based on the budget field. Lead score should reflect urgency, budget, and message quality.`;

export const analyzeLead = async (lead) => {
  const userPrompt = `Analyze this lead:
Name: ${lead.name}
Email: ${lead.email}
Budget: ${lead.budget}
Status: ${lead.status}
Message: ${lead.message}
Submitted: ${lead.createdAt}`;

  const analysis = await generateStructuredResponse(LEAD_ANALYSIS_SYSTEM, userPrompt);

  return {
    summary: analysis.summary || '',
    priority: ['High', 'Medium', 'Low'].includes(analysis.priority) ? analysis.priority : 'Medium',
    category: analysis.category || 'Other',
    tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 8) : [],
    estimatedDealValue: Math.max(0, Number(analysis.estimatedDealValue) || 0),
    sentiment: ['Positive', 'Neutral', 'Negative'].includes(analysis.sentiment)
      ? analysis.sentiment
      : 'Neutral',
    confidenceScore: Math.min(100, Math.max(0, Number(analysis.confidenceScore) || 0)),
    leadScore: Math.min(100, Math.max(0, Number(analysis.leadScore) || 0)),
    recommendedNextAction: analysis.recommendedNextAction || 'Follow up with the lead within 24 hours.',
    analyzedAt: new Date(),
  };
};

const FOLLOW_UP_EMAIL_SYSTEM = `You are a professional sales representative. Generate a personalized follow-up email for a lead. Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "full email body with greeting and sign-off"
}
Keep the tone professional, warm, and concise. Reference specific details from the lead's message.`;

export const generateFollowUpEmail = async (lead, analysis) => {
  const userPrompt = `Generate a follow-up email for:
Name: ${lead.name}
Email: ${lead.email}
Budget: ${lead.budget}
Message: ${lead.message}
Priority: ${analysis?.priority || 'Medium'}
Recommended Action: ${analysis?.recommendedNextAction || 'Schedule a discovery call'}`;

  const email = await generateStructuredResponse(FOLLOW_UP_EMAIL_SYSTEM, userPrompt);

  return {
    subject: email.subject || `Following up on your inquiry, ${lead.name}`,
    body: email.body || '',
    generatedAt: new Date(),
  };
};

const ASSISTANT_SYSTEM = `You are an AI Sales Assistant for a CRM dashboard. You help sales teams manage leads effectively.
You have access to lead data provided in the user message. Answer questions about leads, priorities, follow-ups, and provide actionable recommendations.
Return ONLY valid JSON:
{
  "reply": "your helpful response in markdown-friendly plain text",
  "highlights": ["optional bullet point highlights"],
  "suggestedActions": ["optional suggested actions"]
}
Be concise, data-driven, and reference specific lead names when relevant.`;

export const chatWithAssistant = async (message, leads) => {
  const leadsSummary = leads.map((lead) => ({
    name: lead.name,
    email: lead.email,
    budget: lead.budget,
    status: lead.status,
    message: lead.message?.slice(0, 200),
    createdAt: lead.createdAt,
    priority: lead.aiAnalysis?.priority,
    leadScore: lead.aiAnalysis?.leadScore,
    sentiment: lead.aiAnalysis?.sentiment,
    recommendedNextAction: lead.aiAnalysis?.recommendedNextAction,
    analyzedAt: lead.aiAnalysis?.analyzedAt,
  }));

  const userPrompt = `Current leads data (${leads.length} total):
${JSON.stringify(leadsSummary, null, 2)}

User question: ${message}`;

  const response = await generateStructuredResponse(ASSISTANT_SYSTEM, userPrompt);

  return {
    reply: response.reply || 'I could not process that request. Please try again.',
    highlights: Array.isArray(response.highlights) ? response.highlights : [],
    suggestedActions: Array.isArray(response.suggestedActions) ? response.suggestedActions : [],
  };
};

export const isAiConfigured = () => Boolean(process.env.GROQ_API_KEY);
