import { InferenceClient } from '@huggingface/inference';
import { ApiError } from '../utils/ApiError.js';

const getHfClient = () => {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new ApiError(500, 'HF_TOKEN is missing');
  }
  return new InferenceClient(token);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute chat completion with retry logic.
 * Increased max_tokens to 4096 to avoid truncation.
 */
const executeChatCompletion = async (messages, options = {}) => {
  const client = getHfClient();
  const model = process.env.HF_CODE_MODEL || "Qwen/Qwen2.5-Coder-7B-Instruct";

  let retries = 3;
  let delay = 5000;

  while (retries > 0) {
    try {
      const response = await client.chatCompletion({
        model,
        messages,
        max_tokens: 4096, // Increased for large code
        temperature: options.temperature ?? 0.2
      });

      const output = response?.choices?.[0]?.message?.content;
      if (!output) {
        throw new Error('Empty response from model');
      }
      return output;
    } catch (error) {
      console.error('HF FULL ERROR:', error);
      if (
        error?.status === 503 ||
        error?.message?.includes('loading') ||
        error?.message?.includes('503')
      ) {
        console.log(`Model loading. Retrying in ${delay / 1000}s...`);
        retries--;
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw new ApiError(
        error?.status || 500,
        error?.message || 'Hugging Face request failed'
      );
    }
  }
  throw new ApiError(503, 'Model took too long to load');
};

// 1. Language Conversion – Improved prompt
export const convertCode = async (code, sourceLang, targetLang) => {
  const systemPrompt = `You are an expert compiler and code translator.
Your task is to translate the entire code from ${sourceLang} to ${targetLang} without omitting a single line.
- Preserve all logic, comments, and structure.
- Do not use ellipsis ("..."), placeholders, or abbreviations.
- Return the complete, runnable code in ${targetLang}.
- Do NOT wrap the output in markdown code blocks or add any extra text.`;

  const userPrompt = `Translate the following ${sourceLang} code to ${targetLang} completely:
\n${code}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await executeChatCompletion(messages, { temperature: 0.1 });
};

// 2. Code Optimization – Improved prompt
export const optimizeCode = async (code, language) => {
  const systemPrompt = `You are an expert software engineer specializing in code optimization.
Your task is to optimize the provided ${language} code for performance, readability, and maintainability.
- Return the **complete** optimized code without any omissions.
- Do not use ellipsis, placeholders, or comments like "// rest of code".
- Do NOT wrap the output in markdown code blocks or add any introductory text.`;

  const userPrompt = `Optimize the following ${language} code completely:\n${code}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await executeChatCompletion(messages, { temperature: 0.2 });
};

// 3. Debug & Error Detection – Improved prompt
export const debugCode = async (code, language) => {
  const systemPrompt = `You are a world-class code auditor and debugger.
Analyze the provided ${language} code and produce a comprehensive markdown report.
Your report must include:
- **Summary**: Overview of issues.
- **Issues list**: Detailed list of syntax errors, logical bugs, and code smells.
- **Suggested Fixes**: Step-by-step recommendations.
- **Corrected Code**: The **complete** corrected code, wrapped in a markdown code block with the language tag ${language}.
Do not omit any part of the code. Use no ellipsis or placeholders.`;

  const userPrompt = `Audit and debug the following ${language} code completely:\n${code}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await executeChatCompletion(messages, { temperature: 0.2 });
};

// 4. Code Explanation – Improved prompt
export const explainCode = async (code, language) => {
  const systemPrompt = `You are an enthusiastic programming tutor.
Explain the provided ${language} code in a friendly, clear, and detailed manner.
Structure your response as:
1. **Overview**: High-level purpose and architecture.
2. **Line-by-Line / Block Analysis**: Detailed walkthrough of every section.
3. **Key Concepts**: Explain algorithms, libraries, or paradigms used.
Cover the entire code without skipping any part. Do not use ellipsis or placeholders.`;

  const userPrompt = `Explain the following ${language} code completely:\n${code}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await executeChatCompletion(messages, { temperature: 0.3 });
};

export default {
  convertCode,
  optimizeCode,
  debugCode,
  explainCode
};