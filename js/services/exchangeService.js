const API_BASE_URL = 'https://economia.awesomeapi.com.br';
const FALLBACK_API = 'https://api.exchangerate-api.com/v4/latest';

const CURRENCY_MAP = {
  USD: { awesomeApi: 'USD-BRL', name: 'Dólar Americano', symbol: '$', decimals: 2 },
  EUR: { awesomeApi: 'EUR-BRL', name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { awesomeApi: 'GBP-BRL', name: 'Libra Esterlina', symbol: '£', decimals: 2 },
  CAD: { awesomeApi: 'CAD-BRL', name: 'Dólar Canadense', symbol: 'C$', decimals: 2 },
  AUD: { awesomeApi: 'AUD-BRL', name: 'Dólar Australiano', symbol: 'A$', decimals: 2 },
  JPY: { awesomeApi: 'JPY-BRL', name: 'Iene Japonês', symbol: '¥', decimals: 0 }
};

class ExchangeRateError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'ExchangeRateError';
    this.code = code;
    this.originalError = originalError;
  }
}

const ERROR_CODES = {
  API_OFFLINE: 'E001',
  API_FAILED: 'E002',
  INVALID_CURRENCY: 'E003',
  TIMEOUT: 'E007',
  NETWORK_ERROR: 'E008'
};

async function fetchExchangeRate(currencyCode) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(`${API_BASE_URL}/json/last/${currencyCode}-BRL`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new ExchangeRateError('API request failed', ERROR_CODES.API_OFFLINE);
    }
    
    const data = await response.json();
    const key = `${currencyCode}BRL`;
    
    if (!data[key]) {
      throw new ExchangeRateError('Currency not found', ERROR_CODES.INVALID_CURRENCY);
    }
    
    return {
      code: currencyCode,
      rate: parseFloat(data[key].bid),
      ask: parseFloat(data[key].ask),
      timestamp: new Date(data[key].create_date),
      source: 'AwesomeAPI'
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('AwesomeAPI error:', error);
    return fetchExchangeRateFallback(currencyCode);
  }
}

async function fetchExchangeRateFallback(currencyCode) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(`${FALLBACK_API}/BRL`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new ExchangeRateError('Fallback API failed', ERROR_CODES.API_FAILED);
    }
    
    const data = await response.json();
    
    if (!data.rates[currencyCode]) {
      throw new ExchangeRateError('Currency not found in fallback', ERROR_CODES.INVALID_CURRENCY);
    }
    
    return {
      code: currencyCode,
      rate: data.rates[currencyCode],
      ask: data.rates[currencyCode],
      timestamp: new Date(data.date),
      source: 'ExchangeRate-API'
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fallback API error:', error);
    throw new ExchangeRateError(
      'Both APIs failed',
      ERROR_CODES.API_FAILED,
      error
    );
  }
}

function calculateConversion(brlValue, exchangeRate) {
  return {
    originalValue: brlValue,
    convertedValue: brlValue * exchangeRate.rate,
    rate: exchangeRate.rate,
    currencyCode: exchangeRate.code,
    calculatedAt: exchangeRate.timestamp,
    source: exchangeRate.source
  };
}

function calculateRangeConversion(minBrl, maxBrl, exchangeRate) {
  return {
    minOriginal: minBrl,
    maxOriginal: maxBrl,
    minConverted: minBrl * exchangeRate.rate,
    maxConverted: maxBrl * exchangeRate.rate,
    rate: exchangeRate.rate,
    currencyCode: exchangeRate.code,
    calculatedAt: exchangeRate.timestamp,
    source: exchangeRate.source
  };
}

function getUserMessage(code) {
  const messages = {
    [ERROR_CODES.API_OFFLINE]: 'Serviço de câmbio temporariamente indisponível. Usando taxa alternativa.',
    [ERROR_CODES.API_FAILED]: 'Erro ao buscar taxa de câmbio. Tente novamente em alguns minutos.',
    [ERROR_CODES.INVALID_CURRENCY]: 'Moeda selecionada inválida.',
    [ERROR_CODES.TIMEOUT]: 'Tempo de resposta excedido. Verifique sua conexão e tente novamente.',
    [ERROR_CODES.NETWORK_ERROR]: 'Sem conexão com a internet. Verifique sua rede.'
  };
  
  return messages[code] || 'Ocorreu um erro inesperado.';
}
