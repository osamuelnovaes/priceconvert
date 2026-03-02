const currencyFormats = {
  BRL: { locale: 'pt-BR', currency: 'BRL' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
  CAD: { locale: 'en-CA', currency: 'CAD' },
  AUD: { locale: 'en-AU', currency: 'AUD' },
  JPY: { locale: 'ja-JP', currency: 'JPY' }
};

function formatCurrency(value, currencyCode = 'BRL') {
  if (currencyCode === 'JPY') {
    return Math.round(value).toLocaleString('ja-JP');
  }
  
  const format = currencyFormats[currencyCode] || currencyFormats.BRL;
  
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency
  }).format(value);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function parseBRLInput(value) {
  if (!value) return 0;
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function formatInputAsBRL(input) {
  let value = input.value.replace(/\D/g, '');
  if (!value) {
    input.value = '';
    return;
  }
  value = (value / 100).toFixed(2);
  value = value.replace('.', ',');
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = value;
}

function validateValue(service, value) {
  if (service.id === 'sistema') {
    return {
      isValid: true,
      isOutOfRange: false,
      message: '',
      severity: 'info'
    };
  }
  
  if (value < 0) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Valor não pode ser negativo',
      severity: 'error'
    };
  }
  
  if (value > 10000000) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Valor excede o limite permitido (R$ 10.000.000,00)',
      severity: 'error'
    };
  }
  
  const isBelowMin = value < service.minValue;
  const isAboveMax = value > service.maxValue;
  
  if (isBelowMin) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor abaixo do mínimo de R$ ${formatCurrency(service.minValue, 'BRL')}`,
      severity: 'warning'
    };
  }
  
  if (isAboveMax) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor acima do máximo de R$ ${formatCurrency(service.maxValue, 'BRL')}`,
      severity: 'warning'
    };
  }
  
  return {
    isValid: true,
    isOutOfRange: false,
    message: '',
    severity: 'info'
  };
}
