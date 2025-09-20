/**
 * Multi-language support utilities
 */

import { messages as thMessages } from './th.js';
import { messages as enMessages } from './en.js';
import { messages as zhMessages } from './zh.js';
import { messages as kmMessages } from './km.js';
import { messages as koMessages } from './ko.js';
import { messages as idMessages } from './id.js';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  th: 'ภาษาไทย',
  en: 'English',
  zh: '中文',
  km: 'ខ្មែរ',
  ko: '한국어',
  id: 'Bahasa Indonesia'
};

// Language emoji flags
export const LANGUAGE_FLAGS = {
  th: '🇹🇭',
  en: '🇺🇸',
  zh: '🇨🇳',
  km: '🇰🇭',
  ko: '🇰🇷',
  id: '🇮🇩'
};

// Language messages mapping
const LANGUAGE_MESSAGES = {
  th: thMessages,
  en: enMessages,
  zh: zhMessages,
  km: kmMessages,
  ko: koMessages,
  id: idMessages
};

/**
 * Get messages for a specific language
 * @param {string} languageCode - Language code (th, en, zh, km, ko, id)
 * @returns {object} Messages object
 */
export function getMessages(languageCode = 'th') {
  return LANGUAGE_MESSAGES[languageCode] || LANGUAGE_MESSAGES.th;
}

/**
 * Get language name with flag
 * @param {string} languageCode - Language code
 * @returns {string} Language name with flag
 */
export function getLanguageDisplay(languageCode) {
  const flag = LANGUAGE_FLAGS[languageCode] || '🏳️';
  const name = SUPPORTED_LANGUAGES[languageCode] || 'Unknown';
  return `${flag} ${name}`;
}

/**
 * Detect user language from Telegram locale
 * @param {object} user - Telegram user object
 * @returns {string} Detected language code
 */
export function detectUserLanguage(user) {
  if (!user || !user.language_code) {
    return 'th'; // Default to Thai
  }

  const locale = user.language_code.toLowerCase();
  
  // Map common locales to our supported languages
  const localeMap = {
    'th': 'th',
    'en': 'en',
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh',
    'km': 'km',
    'ko': 'ko',
    'kr': 'ko',
    'id': 'id',
    'in': 'id'
  };

  return localeMap[locale] || 'th'; // Default to Thai
}

/**
 * Format message with variables
 * @param {string} template - Message template with {variable} placeholders
 * @param {object} variables - Variables to replace
 * @returns {string} Formatted message
 */
export function formatMessage(template, variables = {}) {
  let message = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    message = message.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return message;
}

/**
 * Create language selection keyboard
 * @returns {object} Inline keyboard for language selection
 */
export function createLanguageKeyboard() {
  const keyboard = [];
  const languages = Object.entries(SUPPORTED_LANGUAGES);
  
  // Create rows of 2 languages each
  for (let i = 0; i < languages.length; i += 2) {
    const row = [];
    
    // First language in row
    const [code1, name1] = languages[i];
    row.push({
      text: `${LANGUAGE_FLAGS[code1]} ${name1}`,
      callback_data: `lang_${code1}`
    });
    
    // Second language in row (if exists)
    if (i + 1 < languages.length) {
      const [code2, name2] = languages[i + 1];
      row.push({
        text: `${LANGUAGE_FLAGS[code2]} ${name2}`,
        callback_data: `lang_${code2}`
      });
    }
    
    keyboard.push(row);
  }
  
  return { inline_keyboard: keyboard };
}