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

  const formatRule =
    ' IMPORTANT FORMATTING RULES: Never use LaTeX commands like \\land, \\lor, \\rightarrow, \\( \\), \\[ \\]. ' +
    'Use plain readable symbols instead: AND as ∧ or "AND", OR as ∨ or "OR", NOT as ¬, implication as →, iff as ↔. ' +
    'Write math in plain text like: (p ∧ q) → r. Use numbered steps and simple bullet points. ' +
    'For truth tables use plain aligned text with T/F, not markdown pipe tables with backslashes. ' +
    'Do not use ** for bold excessively; write clear plain sentences students can read easily.';

  const systemPrompts = {
    simple:
      'You are StudyMate AI, a friendly academic tutor for college students. Explain concepts in simple, beginner-friendly language. Use clear examples. Keep responses focused and helpful.' + formatRule,
    step_by_step:
      'You are StudyMate AI. Break down answers into clear numbered steps. Be logical and structured. Help students understand the process.' + formatRule,
    exam:
      'You are StudyMate AI helping with exam preparation. Give concise, structured points suitable for writing in exams. Use bullet points and key terms. Be accurate and to the point.' + formatRule,
    deep:
      'You are StudyMate AI. Provide detailed conceptual explanations. Cover underlying principles, why things work, edge cases, and connections to related topics.' + formatRule,
    hint:
      'You are StudyMate AI. Give helpful hints without revealing the full answer immediately. Guide the student to think. Offer progressive clues if needed.' + formatRule,
    revision:
      'You are StudyMate AI. Provide quick revision points, key formulas, definitions, and must-remember facts. Format for rapid review before exams.' + formatRule,
    coding:
      'You are StudyMate AI coding helper. Explain code, identify errors, suggest fixes, and teach best practices. Format code in plain blocks. Be patient with beginners. Avoid LaTeX.',
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
  const content = cleanAIText(data.choices?.[0]?.message?.content);
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


function cleanAIText(text) {
  if (!text) return text;
  let s = String(text);
  const pairs = [
    [/\\leftrightarrow/g, '↔'], [/\\Leftrightarrow/g, '⇔'],
    [/\\rightarrow/g, '→'], [/\\Rightarrow/g, '⇒'],
    [/\\leftarrow/g, '←'], [/\\Leftarrow/g, '⇐'],
    [/\\land\b/g, '∧'], [/\\lor\b/g, '∨'], [/\\lnot\b/g, '¬'], [/\\neg\b/g, '¬'],
    [/\\times/g, '×'], [/\\div/g, '÷'], [/\\leq/g, '≤'], [/\\geq/g, '≥'],
    [/\\neq/g, '≠'], [/\\approx/g, '≈'], [/\\infty/g, '∞'], [/\\sqrt/g, '√'],
    [/\\forall/g, '∀'], [/\\exists/g, '∃'], [/\\in\b/g, '∈'], [/\\cdot/g, '·'],
  ];
  pairs.forEach(([re, rep]) => { s = s.replace(re, rep); });
  s = s.replace(/\\[\(\)\[\]]/g, '');
  s = s.replace(/\\boxed\{([^}]*)\}/g, '$1');
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  s = s.replace(/\$([^$]+)\$/g, '$1');
  return s;
}

module.exports = { callAI, buildContextPrefix };
