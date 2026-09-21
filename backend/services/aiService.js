/**
 * AI Service - calls external AI API securely from backend only.
 * Never expose AI_API_KEY to frontend.
 */

const callAI = async ({ messages, mode = 'simple', temperature = 0.7 }) => {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
  }

  const systemPrompts = {
    simple:
      'You are StudyMate AI, a friendly academic tutor for college students. Explain concepts in simple, beginner-friendly language. Use clear examples. Keep responses focused and helpful.',
    step_by_step:
      'You are StudyMate AI. Break down answers into clear numbered steps. Be logical and structured. Help students understand the process.',
    exam:
      'You are StudyMate AI helping with exam preparation. Give concise, structured points suitable for writing in exams. Use bullet points and key terms. Be accurate and to the point.',
    deep:
      'You are StudyMate AI. Provide detailed conceptual explanations. Cover underlying principles, why things work, edge cases, and connections to related topics.',
    hint:
      'You are StudyMate AI. Give helpful hints without revealing the full answer immediately. Guide the student to think. Offer progressive clues if needed.',
    revision:
      'You are StudyMate AI. Provide quick revision points, key formulas, definitions, and must-remember facts. Format for rapid review before exams.',
    coding:
      'You are StudyMate AI coding helper. Explain code, identify errors, suggest fixes, and teach best practices. Format code clearly. Be patient with beginners.',
  };

  const systemMessage = {
    role: 'system',
    content: systemPrompts[mode] || systemPrompts.simple,
  };

  const body = {
    model,
    messages: [systemMessage, ...messages],
    temperature,
    max_tokens: 1500,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('AI API error:', response.status, errText);
    throw new Error('StudyMate AI is temporarily unavailable. Please try again later.');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('StudyMate AI returned an empty response. Please try again.');
  }
  return content;
};

const buildContextPrefix = (subjectName, topic) => {
  let prefix = '';
  if (subjectName) prefix += `Subject context: ${subjectName}. `;
  if (topic) prefix += `Current topic: ${topic}. `;
  return prefix;
};

module.exports = { callAI, buildContextPrefix };
