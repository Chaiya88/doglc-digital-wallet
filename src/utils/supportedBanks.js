/**
 * Comprehensive Thai Banking System Support
 * Complete list of supported banks for DOGLC Digital Wallet
 */

export const SUPPORTED_BANKS = {
  // Major Commercial Banks (Big 4)
  KBANK: {
    code: 'KBANK',
    name: 'ธนาคารกสิกรไทย',
    name_en: 'Kasikornbank',
    color: '#4CAF50',
    logo: '🏦',
    swift_code: 'KASITHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 2000000,
    monthly_limit: 60000000,
    fee_percentage: 0.25,
    processing_time: '5-15 นาที'
  },
  
  SCB: {
    code: 'SCB',
    name: 'ธนาคารไทยพาณิชย์',
    name_en: 'Siam Commercial Bank',
    color: '#9C27B0',
    logo: '🏦',
    swift_code: 'SICOTHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 1500000,
    monthly_limit: 45000000,
    fee_percentage: 0.25,
    processing_time: '5-15 นาที'
  },

  BBL: {
    code: 'BBL',
    name: 'ธนาคารกรุงเทพ',
    name_en: 'Bangkok Bank',
    color: '#2196F3',
    logo: '🏦',
    swift_code: 'BKKBTHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 1800000,
    monthly_limit: 50000000,
    fee_percentage: 0.25,
    processing_time: '5-15 นาที'
  },

  KTB: {
    code: 'KTB',
    name: 'ธนาคารกรุงไทย',
    name_en: 'Krung Thai Bank',
    color: '#FF9800',
    logo: '🏦',
    swift_code: 'KRTHTHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 1200000,
    monthly_limit: 35000000,
    fee_percentage: 0.30,
    processing_time: '10-20 นาที'
  },

  // Other Major Banks
  TMB: {
    code: 'TMB',
    name: 'ธนาคารทีเอ็มบีธนชาต',
    name_en: 'TMB Thanachart Bank',
    color: '#607D8B',
    logo: '🏦',
    swift_code: 'TMBKTHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 1000000,
    monthly_limit: 30000000,
    fee_percentage: 0.30,
    processing_time: '10-20 นาที'
  },

  BAY: {
    code: 'BAY',
    name: 'ธนาคารกรุงศรีอยุธยา',
    name_en: 'Bank of Ayudhya (Krungsri)',
    color: '#E91E63',
    logo: '🏦',
    swift_code: 'AYUDTHBK',
    category: 'major',
    features: ['promptpay', 'mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 1300000,
    monthly_limit: 40000000,
    fee_percentage: 0.25,
    processing_time: '5-15 นาที'
  },

  // International Banks in Thailand
  UOB: {
    code: 'UOB',
    name: 'ธนาคารยูโอบี',
    name_en: 'United Overseas Bank',
    color: '#1976D2',
    logo: '🏦',
    swift_code: 'UOVBTHBK',
    category: 'international',
    features: ['mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 800000,
    monthly_limit: 25000000,
    fee_percentage: 0.35,
    processing_time: '15-30 นาที'
  },

  CIMB: {
    code: 'CIMB',
    name: 'ธนาคารซีไอเอ็มบี',
    name_en: 'CIMB Thai Bank',
    color: '#795548',
    logo: '🏦',
    swift_code: 'CITHTHBK',
    category: 'international',
    features: ['mobile_banking', 'qr_payment', 'slip_verification'],
    daily_limit: 600000,
    monthly_limit: 20000000,
    fee_percentage: 0.35,
    processing_time: '15-30 นาที'
  },

  // Additional Banks
  TISCO: {
    code: 'TISCO',
    name: 'ธนาคารทิสโก้',
    name_en: 'Tisco Bank',
    color: '#009688',
    logo: '🏦',
    swift_code: 'TFPCTHBK',
    category: 'specialized',
    features: ['mobile_banking', 'qr_payment'],
    daily_limit: 500000,
    monthly_limit: 15000000,
    fee_percentage: 0.40,
    processing_time: '20-45 นาที'
  },

  LHBANK: {
    code: 'LHBANK',
    name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    name_en: 'Land and Houses Bank',
    color: '#FF5722',
    logo: '🏦',
    swift_code: 'LADBTHBK',
    category: 'specialized',
    features: ['mobile_banking', 'qr_payment'],
    daily_limit: 400000,
    monthly_limit: 12000000,
    fee_percentage: 0.40,
    processing_time: '20-45 นาที'
  },

  IBANK: {
    code: 'IBANK',
    name: 'ธนาคารอิสลามแห่งประเทศไทย',
    name_en: 'Islamic Bank of Thailand',
    color: '#4CAF50',
    logo: '🏦',
    swift_code: 'ISBKTHBK',
    category: 'specialized',
    features: ['mobile_banking', 'islamic_banking'],
    daily_limit: 300000,
    monthly_limit: 10000000,
    fee_percentage: 0.45,
    processing_time: '30-60 นาที'
  },

  GSBANK: {
    code: 'GSBANK',
    name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
    name_en: 'Bank for Agriculture and Agricultural Cooperatives',
    color: '#8BC34A',
    logo: '🏦',
    swift_code: 'BAACTHBK',
    category: 'government',
    features: ['mobile_banking', 'agricultural_support'],
    daily_limit: 800000,
    monthly_limit: 25000000,
    fee_percentage: 0.30,
    processing_time: '15-30 นาที'
  },

  GHBANK: {
    code: 'GHBANK',
    name: 'ธนาคารอาคารสงเคราะห์',
    name_en: 'Government Housing Bank',
    color: '#FF9800',
    logo: '🏦',
    swift_code: 'GSBATHBK',
    category: 'government',
    features: ['mobile_banking', 'housing_support'],
    daily_limit: 600000,
    monthly_limit: 20000000,
    fee_percentage: 0.30,
    processing_time: '15-30 นาที'
  }
};

/**
 * Bank categories for easy filtering
 */
export const BANK_CATEGORIES = {
  major: ['KBANK', 'SCB', 'BBL', 'KTB', 'TMB', 'BAY'],
  international: ['UOB', 'CIMB'],
  specialized: ['TISCO', 'LHBANK', 'IBANK'],
  government: ['GSBANK', 'GHBANK']
};

/**
 * Get banks by category
 */
export function getBanksByCategory(category) {
  const bankCodes = BANK_CATEGORIES[category] || [];
  return bankCodes.map(code => SUPPORTED_BANKS[code]).filter(Boolean);
}

/**
 * Get all supported banks
 */
export function getAllSupportedBanks() {
  return Object.values(SUPPORTED_BANKS);
}

/**
 * Get bank information by code
 */
export function getBankInfo(bankCode) {
  return SUPPORTED_BANKS[bankCode] || null;
}

/**
 * Get banks with specific features
 */
export function getBanksByFeature(feature) {
  return Object.values(SUPPORTED_BANKS).filter(bank => 
    bank.features.includes(feature)
  );
}

/**
 * Get banks sorted by daily limit
 */
export function getBanksByLimit(descending = true) {
  const banks = Object.values(SUPPORTED_BANKS);
  return banks.sort((a, b) => 
    descending ? b.daily_limit - a.daily_limit : a.daily_limit - b.daily_limit
  );
}

/**
 * Generate bank selection keyboard for admin
 */
export function getBankSelectionKeyboard() {
  const majorBanks = getBanksByCategory('major');
  const otherBanks = [
    ...getBanksByCategory('international'),
    ...getBanksByCategory('specialized'),
    ...getBanksByCategory('government')
  ];

  const keyboard = [];

  // Major banks (2 per row)
  for (let i = 0; i < majorBanks.length; i += 2) {
    const row = [];
    if (majorBanks[i]) {
      row.push({
        text: `${majorBanks[i].logo} ${majorBanks[i].name} (${majorBanks[i].code})`,
        callback_data: `bank_add_${majorBanks[i].code.toLowerCase()}`
      });
    }
    if (majorBanks[i + 1]) {
      row.push({
        text: `${majorBanks[i + 1].logo} ${majorBanks[i + 1].name} (${majorBanks[i + 1].code})`,
        callback_data: `bank_add_${majorBanks[i + 1].code.toLowerCase()}`
      });
    }
    keyboard.push(row);
  }

  // Other banks (1 per row for clarity)
  otherBanks.forEach(bank => {
    keyboard.push([{
      text: `${bank.logo} ${bank.name} (${bank.code})`,
      callback_data: `bank_add_${bank.code.toLowerCase()}`
    }]);
  });

  // Cancel button
  keyboard.push([{
    text: '🔙 ยกเลิก',
    callback_data: 'bank_management'
  }]);

  return { inline_keyboard: keyboard };
}

/**
 * Generate bank statistics summary
 */
export function getBankStatsSummary() {
  const allBanks = getAllSupportedBanks();
  const totalBanks = allBanks.length;
  const totalDailyLimit = allBanks.reduce((sum, bank) => sum + bank.daily_limit, 0);
  const totalMonthlyLimit = allBanks.reduce((sum, bank) => sum + bank.monthly_limit, 0);
  
  const categoryCounts = {
    major: getBanksByCategory('major').length,
    international: getBanksByCategory('international').length,
    specialized: getBanksByCategory('specialized').length,
    government: getBanksByCategory('government').length
  };

  const featureCounts = {
    promptpay: getBanksByFeature('promptpay').length,
    mobile_banking: getBanksByFeature('mobile_banking').length,
    qr_payment: getBanksByFeature('qr_payment').length,
    slip_verification: getBanksByFeature('slip_verification').length
  };

  return {
    totalBanks,
    totalDailyLimit,
    totalMonthlyLimit,
    categoryCounts,
    featureCounts,
    averageDailyLimit: Math.round(totalDailyLimit / totalBanks),
    averageMonthlyLimit: Math.round(totalMonthlyLimit / totalBanks)
  };
}