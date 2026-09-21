const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const key = process.env.AI_API_KEY;
  const url = process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  const model = process.env.AI_MODEL || 'llama-3.1-8b-instant';

  console.log('--- AI Test ---');
  console.log('AI_API_KEY loaded?', !!(key && key.trim()));
  console.log('Key starts with:', key ? key.slice(0, 6) + '...' : '(empty)');
  console.log('URL:', url);
  console.log('Model:', model);

  if (!key || !key.trim() || key.includes('yahan') || key.includes('your_')) {
    console.log('FAIL: Put real Groq key in .env as AI_API_KEY=gsk_...');
    process.exit(1);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key.trim(),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
        max_tokens: 50,
      }),
    });
    const text = await res.text();
    console.log('HTTP status:', res.status);
    if (!res.ok) {
      console.log('FAIL body:', text.slice(0, 500));
      process.exit(1);
    }
    const data = JSON.parse(text);
    console.log('SUCCESS:', data.choices?.[0]?.message?.content || data);
  } catch (e) {
    console.log('FAIL:', e.message);
    process.exit(1);
  }
}
main();
