/**
 * Localization Index
 * Multi-language support for DOGLC Digital Wallet Bot
 */

import { thMessages } from './th.js';
import { enMessages } from './en.js';
import { zhMessages } from './zh.js';
import { kmMessages } from './km.js';
import { koMessages } from './ko.js';
import { idMessages } from './id.js';

// Language mapping
const languages = {
  th: thMessages,    // Thai (Default)
  en: enMessages,    // English
  zh: zhMessages,    // Chinese
  km: kmMessages,    // Khmer (Cambodian)
  ko: koMessages,    // Korean
  id: idMessages     // Indonesian
};

// Default language
const DEFAULT_LANGUAGE = 'th';

/**
 * Get localized message
 * @param {string} languageCode - Language code (th, en, zh, km, ko, id)
 * @param {string} messageKey - Message key
 * @param {object} params - Parameters to replace in message
 * @returns {string} Localized message
 */
export function getLocalizedMessage(languageCode = DEFAULT_LANGUAGE, messageKey, params = {}) {
  try {
    // Normalize language code
    const langCode = normalizeLanguageCode(languageCode);
    
    // Get language messages
    const langMessages = languages[langCode] || languages[DEFAULT_LANGUAGE];
    
    // Get message
    let message = langMessages[messageKey];
    
    // Fallback to default language if message not found
    if (!message && langCode !== DEFAULT_LANGUAGE) {
      message = languages[DEFAULT_LANGUAGE][messageKey];
    }
    
    // Fallback to message key if still not found
    if (!message) {
      console.warn(`Message key '${messageKey}' not found for language '${langCode}'`);
      return `[${messageKey}]`;
    }
    
    // Replace parameters in message
    return replacePlaceholders(message, params);
    
  } catch (error) {
    console.error('Error getting localized message:', error);
    return `[Error: ${messageKey}]`;
  }
}

/**
 * Normalize language code to supported format
 * @param {string} languageCode - Raw language code
 * @returns {string} Normalized language code
 */
function normalizeLanguageCode(languageCode) {
  if (!languageCode) return DEFAULT_LANGUAGE;
  
  const code = languageCode.toLowerCase().substring(0, 2);
  
  // Map variations to standard codes
  const mapping = {
    'th': 'th', // Thai
    'en': 'en', // English
    'zh': 'zh', // Chinese (Simplified/Traditional)
    'cn': 'zh', // Chinese alternative
    'km': 'km', // Khmer
    'kh': 'km', // Khmer alternative
    'ko': 'ko', // Korean
    'kr': 'ko', // Korean alternative
    'id': 'id', // Indonesian
    'in': 'id'  // Indonesian alternative
  };
  
  return mapping[code] || DEFAULT_LANGUAGE;
}

/**
 * Replace placeholders in message
 * @param {string} message - Message with placeholders
 * @param {object} params - Parameters to replace
 * @returns {string} Message with replaced placeholders
 */
function replacePlaceholders(message, params) {
  if (!params || typeof params !== 'object') {
    return message;
  }
  
  let result = message;
  
  // Replace {key} placeholders
  Object.keys(params).forEach(key => {
    const placeholder = `{${key}}`;
    const value = params[key];
    
    if (result.includes(placeholder)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
  });
  
  return result;
}

/**
 * Get supported languages list
 * @returns {Array} Array of supported language objects
 */
export function getSupportedLanguages() {
  return [
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' }
  ];
}

/**
 * Get language selection keyboard
 * @param {string} currentLang - Current language code
 * @returns {object} Inline keyboard for language selection
 */
export function getLanguageKeyboard(currentLang = DEFAULT_LANGUAGE) {
  const languages = getSupportedLanguages();
  
  const keyboard = languages.map(lang => {
    const isSelected = lang.code === currentLang;
    const text = `${lang.flag} ${lang.name}${isSelected ? ' ✓' : ''}`;
    
    return [{
      text,
      callback_data: `set_language_${lang.code}`
    }];
  });
  
  // Add back button
  keyboard.push([{
    text: '🔙 Back / กลับ',
    callback_data: 'main_menu'
  }]);
  
  return { inline_keyboard: keyboard };
}

/**
 * Format currency based on language
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} languageCode - Language code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USDT', languageCode = DEFAULT_LANGUAGE) {
  const num = parseFloat(amount) || 0;
  const langCode = normalizeLanguageCode(languageCode);
  
  try {
    switch (currency.toUpperCase()) {
      case 'THB':
        return new Intl.NumberFormat('th-TH', {
          style: 'currency',
          currency: 'THB'
        }).format(num);
        
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num);
        
      case 'CNY':
        return new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: 'CNY'
        }).format(num);
        
      case 'KHR':
        return new Intl.NumberFormat('km-KH').format(num) + ' ៛';
        
      case 'KRW':
        return new Intl.NumberFormat('ko-KR', {
          style: 'currency',
          currency: 'KRW'
        }).format(num);
        
      case 'IDR':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(num);
        
      case 'USDT':
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8
        }).format(num) + ' USDT';
    }
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return `${num} ${currency}`;
  }
}

/**
 * Get localized date string
 * @param {Date|number} date - Date object or timestamp
 * @param {string} languageCode - Language code
 * @returns {string} Localized date string
 */
export function formatDate(date, languageCode = DEFAULT_LANGUAGE) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const langCode = normalizeLanguageCode(languageCode);
  
  const localeMap = {
    th: 'th-TH',
    en: 'en-US',
    zh: 'zh-CN',
    km: 'km-KH',
    ko: 'ko-KR',
    id: 'id-ID'
  };
  
  const locale = localeMap[langCode] || localeMap[DEFAULT_LANGUAGE];
  
  try {
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateObj.toISOString();
  }
}