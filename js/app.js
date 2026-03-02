(function() {
  'use strict';

  const elements = {
    serviceSelect: document.getElementById('service-select'),
    valueRange: document.getElementById('value-range'),
    brlValue: document.getElementById('brl-value'),
    currencySelect: document.getElementById('currency-select'),
    calculateBtn: document.getElementById('btn-calculate'),
    clearBtn: document.getElementById('btn-clear'),
    newCalcBtn: document.getElementById('btn-new'),
    resultCard: document.getElementById('result'),
    alertBox: document.getElementById('alert'),
    loadingSpinner: document.getElementById('loading')
  };

  let currentService = null;
  let currentCurrency = null;

  function init() {
    populateServiceSelect();
    populateCurrencySelect();
    attachEventListeners();
  }

  function populateServiceSelect() {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um serviço...';
    elements.serviceSelect.appendChild(defaultOption);

    Object.values(SERVICES).forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name;
      elements.serviceSelect.appendChild(option);
    });
  }

  function populateCurrencySelect() {
    CURRENCY_LIST.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency.code;
      option.textContent = currency.name;
      elements.currencySelect.appendChild(option);
    });
  }

  function attachEventListeners() {
    elements.serviceSelect.addEventListener('change', handleServiceChange);
    elements.brlValue.addEventListener('input', handleValueInput);
    elements.brlValue.addEventListener('blur', handleValueBlur);
    elements.calculateBtn.addEventListener('click', handleCalculate);
    elements.clearBtn.addEventListener('click', handleClear);
    elements.newCalcBtn.addEventListener('click', handleClear);
  }

  function handleServiceChange() {
    const serviceId = elements.serviceSelect.value;
    currentService = serviceId ? SERVICES[serviceId] : null;
    
    displayValueRange(currentService);
    hideAlert();
    hideResult();
    
    if (currentService) {
      elements.brlValue.focus();
    }
  }

  function displayValueRange(service) {
    if (!service) {
      elements.valueRange.textContent = '';
      elements.valueRange.className = 'value-range';
      return;
    }

    const { minValue, maxValue, unit } = service;

    if (minValue === null && maxValue === null) {
      elements.valueRange.textContent = 'Entrada livre (sem restrição de valor)';
      elements.valueRange.className = 'value-range value-range--free';
      return;
    }

    if (minValue === maxValue) {
      elements.valueRange.textContent = `${formatCurrency(minValue, 'BRL')} (valor fixo)`;
    } else {
      const unitText = unit ? ` /${unit}` : '';
      elements.valueRange.textContent = `${formatCurrency(minValue, 'BRL')} - ${formatCurrency(maxValue, 'BRL')}${unitText}`;
    }

    elements.valueRange.className = 'value-range value-range--active';
  }

  function handleValueInput(e) {
    formatInputAsBRL(e.target);
    hideAlert();
  }

  function handleValueBlur() {
    if (!currentService || !elements.brlValue.value) {
      return;
    }

    const value = parseBRLInput(elements.brlValue.value);
    const validation = validateValue(currentService, value);
    
    if (!validation.isValid) {
      showAlert(validation.message, 'error');
    } else if (validation.isOutOfRange) {
      showAlert(validation.message, 'warning');
    } else {
      hideAlert();
    }
  }

  async function handleCalculate() {
    if (!validateForm()) {
      return;
    }

    const brlValue = parseBRLInput(elements.brlValue.value);
    const currencyCode = elements.currencySelect.value;
    currentCurrency = CURRENCIES[currencyCode];

    showLoading();
    hideAlert();
    hideResult();

    try {
      const exchangeRate = await fetchExchangeRate(currencyCode);
      const calculation = calculateConversion(brlValue, exchangeRate);
      displayResult(calculation, currentCurrency);
    } catch (error) {
      showAlert(getUserMessage(error.code) || error.message, 'error');
    } finally {
      hideLoading();
    }
  }

  function displayResult(calculation, currency) {
    const resultDiv = elements.resultCard;
    
    const formattedOriginal = formatCurrency(calculation.originalValue, 'BRL');
    const formattedConverted = formatCurrency(calculation.convertedValue, currency.code);
    
    const rateDisplay = currency.code === 'JPY' 
      ? calculation.rate.toFixed(2)
      : calculation.rate.toFixed(4);

    resultDiv.innerHTML = `
      <div class="result-original">
        <span class="label">Valor Original</span>
        <span class="value">R$ ${formattedOriginal}</span>
      </div>
      
      <div class="result-divider"></div>
      
      <div class="result-converted-info">
        <span class="label">Convertido para</span>
        <span class="currency-code">${currency.code}</span>
        <span class="currency-name">${currency.name}</span>
        
        <div class="exchange-rate">
          Taxa de Câmbio: 1 BRL = ${rateDisplay} ${currency.code}
          <span class="source">(${calculation.source})</span>
        </div>
        <div class="timestamp">
          Atualizado em: ${formatDateTime(calculation.calculatedAt)}
        </div>
      </div>
      
      <div class="result-divider"></div>
      
      <div class="result-final">
        <span class="symbol">${currency.symbol}</span>
        <span class="value">${formattedConverted.replace(currency.symbol, '').trim()}</span>
      </div>
      
      <div class="btn-group">
        <button type="button" class="btn btn--secondary" id="btn-clear">Limpar</button>
        <button type="button" class="btn btn--secondary" id="btn-new">Novo Cálculo</button>
      </div>
    `;

    document.getElementById('btn-clear').addEventListener('click', handleClear);
    document.getElementById('btn-new').addEventListener('click', handleClear);
    
    resultDiv.classList.add('result-card--visible');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validateForm() {
    if (!elements.serviceSelect.value) {
      showAlert('Selecione um tipo de serviço.', 'error');
      elements.serviceSelect.focus();
      return false;
    }

    if (!elements.brlValue.value) {
      showAlert('Informe o valor em Reais.', 'error');
      elements.brlValue.focus();
      return false;
    }

    const value = parseBRLInput(elements.brlValue.value);
    if (value <= 0) {
      showAlert('Informe um valor válido maior que zero.', 'error');
      elements.brlValue.focus();
      return false;
    }

    if (!elements.currencySelect.value) {
      showAlert('Selecione uma moeda para conversão.', 'error');
      elements.currencySelect.focus();
      return false;
    }

    return true;
  }

  function showAlert(message, type = 'info') {
    elements.alertBox.textContent = message;
    elements.alertBox.className = `alert alert--${type} alert--visible`;
  }

  function hideAlert() {
    elements.alertBox.className = 'alert';
  }

  function hideResult() {
    elements.resultCard.className = 'result-card';
    elements.resultCard.innerHTML = '';
  }

  function showLoading() {
    elements.loadingSpinner.classList.add('loading--visible');
    elements.calculateBtn.disabled = true;
    elements.calculateBtn.textContent = 'Calculando...';
  }

  function hideLoading() {
    elements.loadingSpinner.classList.remove('loading--visible');
    elements.calculateBtn.disabled = false;
    elements.calculateBtn.textContent = 'Calcular Conversão';
  }

  function handleClear() {
    elements.serviceSelect.value = '';
    elements.brlValue.value = '';
    elements.currencySelect.value = 'USD';
    
    currentService = null;
    currentCurrency = null;
    
    elements.valueRange.textContent = '';
    elements.valueRange.className = 'value-range';
    
    hideAlert();
    hideResult();
    
    elements.serviceSelect.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
