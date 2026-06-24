import History from '../models/History.js';
import * as aiService from '../services/ai.service.js';
import securityService from '../services/security.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const ALLOWED_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp'];
const MAX_CODE_LENGTH_BYTES = 50 * 1024; // 50 KB

// Pre-screen code and instructions for safety and size violations
const performSecurityChecks = (code, language, extraInstructions = '') => {
  if (!code || typeof code !== 'string') {
    throw new ApiError(400, 'Code payload must be a non-empty string');
  }

  // 1. Code length validation (Max 50KB)
  const codeSizeBytes = Buffer.byteLength(code, 'utf8');
  if (codeSizeBytes > MAX_CODE_LENGTH_BYTES) {
    throw new ApiError(400, `Code size exceeds the maximum limit of 50KB (current: ${(codeSizeBytes / 1024).toFixed(2)}KB)`);
  }

  // 2. Language support validation
  if (language && !ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
    throw new ApiError(400, `Unsupported language: ${language}. Supported: ${ALLOWED_LANGUAGES.join(', ')}`);
  }

  // 3. Scan for prompt injection in extra instructions
  if (extraInstructions) {
    const promptSec = securityService.scanPromptInjection(extraInstructions);
    if (!promptSec.isSecure) {
      throw new ApiError(400, 'Security violation: Suspicious prompt pattern detected.');
    }
  }

  // 4. Scan code itself for security threats
  const codeSec = securityService.scanCodeSecurity(code);
  if (!codeSec.isSecure) {
    throw new ApiError(
      400,
      `Security violation: Malicious code signatures detected: ${codeSec.matches.join(', ')}`
    );
  }
};

// Log successful operations to history DB
const logOperationToHistory = async (req, type, sourceLang, targetLang, inputCode, outputCode) => {
  try {
    await History.create({
      user: req.user?._id || null, // null for guest
      ipAddress: req.ip,
      operationType: type,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang || '',
      inputCode,
      outputCode
    });
    logger.info(`AI operation logged to history: ${type} (${sourceLang})`, { requestId: req.requestId });
  } catch (error) {
    logger.error('Failed to log operation to history:', error);
  }
};

export const convert = asyncHandler(async (req, res) => {
  const { code, sourceLang, targetLang } = req.body;

  if (!code || !sourceLang || !targetLang) {
    throw new ApiError(400, 'Missing required fields: code, sourceLang, targetLang');
  }

  performSecurityChecks(code, sourceLang);
  
  if (!ALLOWED_LANGUAGES.includes(targetLang.toLowerCase())) {
    throw new ApiError(400, `Unsupported target language: ${targetLang}`);
  }

  logger.info(`Running language conversion: ${sourceLang} -> ${targetLang}`, { requestId: req.requestId });

  const result = await aiService.convertCode(code, sourceLang, targetLang);

  await logOperationToHistory(req, 'convert', sourceLang, targetLang, code, result);

  return res.status(200).json(new ApiResponse(200, { outputCode: result }, 'Code converted successfully'));
});

export const optimize = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    throw new ApiError(400, 'Missing required fields: code, language');
  }

  performSecurityChecks(code, language);

  logger.info(`Running code optimization: ${language}`, { requestId: req.requestId });

  const result = await aiService.optimizeCode(code, language);

  await logOperationToHistory(req, 'optimize', language, '', code, result);

  return res.status(200).json(new ApiResponse(200, { outputCode: result }, 'Code optimized successfully'));
});

export const debug = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    throw new ApiError(400, 'Missing required fields: code, language');
  }

  performSecurityChecks(code, language);

  logger.info(`Running code debug audit: ${language}`, { requestId: req.requestId });

  const result = await aiService.debugCode(code, language);

  await logOperationToHistory(req, 'debug', language, '', code, result);

  return res.status(200).json(new ApiResponse(200, { report: result }, 'Code audit completed successfully'));
});

export const explain = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    throw new ApiError(400, 'Missing required fields: code, language');
  }

  performSecurityChecks(code, language);

  logger.info(`Running code explanation: ${language}`, { requestId: req.requestId });

  const result = await aiService.explainCode(code, language);

  await logOperationToHistory(req, 'explain', language, '', code, result);

  return res.status(200).json(new ApiResponse(200, { explanation: result }, 'Code explanation generated successfully'));
});
