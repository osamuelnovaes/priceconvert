(function() {
  'use strict';

  const elements = {
    servicesGrid: document.getElementById('services-grid'),
    selectedServices: document.getElementById('selected-services'),
    currencySelect: document.getElementById('currency-select'),
    resultCard: document.getElementById('result'),
    alertBox: document.getElementById('alert'),
    loadingSpinner: document.getElementById('loading')
  };

  let selectedServices = [];
  let exchangeRate = null;
  let rateLoaded = false;

  function init() {
    renderServicesGrid();
    populateCurrencySelect();
    attachEventListeners();
    loadExchangeRate();
  }

  function renderServicesGrid() {
    elements.servicesGrid.innerHTML = '';
    
    Object.values(SERVICES).forEach(service => {
      const container = document.createElement('div');
      container.className = 'service-checkbox';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `service-${service.id}`;
      input.value = service.id;
      input.addEventListener('change', () => handleServiceToggle(service.id));
      
      const label = document.createElement('label');
      label.htmlFor = `service-${service.id}`;
      
      const checkmark = document.createElement('span');
      checkmark.className = 'checkmark';
      
      const text = document.createTextNode(service.name);
      
      label.appendChild(checkmark);
      label.appendChild(text);
      
      container.appendChild(input);
      container.appendChild(label);
      
      elements.servicesGrid.appendChild(container);
    });
  }

  function handleServiceToggle(serviceId) {
    const service = SERVICES[serviceId];
    
    if (selectedServices.find(s => s.id === serviceId)) {
      selectedServices = selectedServices.filter(s => s.id !== serviceId);
    } else {
      selectedServices.push(service);
    }
    
    updateSelectedServicesDisplay();
    displayResults();
  }

  function updateSelectedServicesDisplay() {
    elements.selectedServices.innerHTML = '';
    
    selectedServices.forEach(service => {
      const tag = document.createElement('span');
      tag.className = 'selected-service-tag';
      tag.innerHTML = `
        ${service.name}
        <span class="remove-service" data-id="${service.id}">×</span>
      `;
      
      tag.querySelector('.remove-service').addEventListener('click', () => {
        document.getElementById(`service-${service.id}`).checked = false;
        handleServiceToggle(service.id);
      });
      
      elements.selectedServices.appendChild(tag);
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
    elements.currencySelect.addEventListener('change', async () => {
      await loadExchangeRate();
      displayResults();
    });
  }

  async function loadExchangeRate() {
    const currencyCode = elements.currencySelect.value;
    
    showLoading();
    
    try {
      exchangeRate = await fetchExchangeRate(currencyCode);
      if (!exchangeRate || !exchangeRate.rate) {
        throw new Error('Taxa de câmbio inválida');
      }
      rateLoaded = true;
    } catch (error) {
      console.error('Erro:', error);
      showAlert(error.message || 'Erro ao buscar taxa de câmbio', 'error');
    } finally {
      hideLoading();
    }
  }

  function displayResults() {
    if (selectedServices.length === 0) {
      hideResult();
      return;
    }

    if (!rateLoaded || !exchangeRate) {
      return;
    }

    const currencyCode = elements.currencySelect.value;
    const currency = CURRENCIES[currencyCode];
    const rate = exchangeRate.rate;
    const resultDiv = elements.resultCard;
    
    let servicesHtml = '';
    let totalMinBrl = 0;
    let totalMaxBrl = 0;
    let hasFreeValue = false;
    
    selectedServices.forEach(service => {
      const minConverted = service.minValue ? service.minValue / rate : null;
      const maxConverted = service.maxValue ? service.maxValue / rate : null;
      
      if (service.minValue === null || service.maxValue === null) {
        hasFreeValue = true;
      } else {
        totalMinBrl += service.minValue;
        totalMaxBrl += service.maxValue;
      }
      
      const minDisplay = service.minValue ? formatCurrency(service.minValue, 'BRL') : 'Livre';
      const maxDisplay = service.maxValue ? formatCurrency(service.maxValue, 'BRL') : 'Livre';
      
      const rangeDisplay = (service.minValue === null && service.maxValue === null) 
        ? 'Valor livre'
        : (service.minValue === service.maxValue)
          ? `${minDisplay} (fixo)`
          : `${minDisplay} - ${maxDisplay}`;
      
      const convertedRange = (minConverted === null && maxConverted === null)
        ? 'Valor livre'
        : (minConverted === maxConverted)
          ? `${currency.symbol}${(minConverted).toFixed(currency.decimals)} (fixo)`
          : `${currency.symbol}${(minConverted).toFixed(currency.decimals)} - ${currency.symbol}${(maxConverted).toFixed(currency.decimals)}`;
      
      servicesHtml += `
        <div class="service-values">
          <div class="service-values__header">
            <span class="service-values__name">${service.name}</span>
          </div>
          <div class="service-values__range">
            <strong>Em BRL:</strong> ${rangeDisplay}
          </div>
          <div class="service-values__converted">
            <strong>${currency.code}:</strong> ${convertedRange}
          </div>
        </div>
      `;
    });

    const totalMinConverted = totalMinBrl / rate;
    const totalMaxConverted = totalMaxBrl / rate;
    
    let totalHtml = '';
    if (hasFreeValue) {
      totalHtml = `
        <div class="service-values service-values--total">
          <div class="service-values__header">
            <span class="service-values__name">TOTAL</span>
          </div>
          <div class="service-values__range">
            <strong>Em BRL:</strong> Inclui serviços com valor livre
          </div>
          <div class="service-values__converted">
            <strong>${currency.code}:</strong> Sob consulta
          </div>
        </div>
      `;
    } else {
      const totalMinDisplay = formatCurrency(totalMinBrl, 'BRL');
      const totalMaxDisplay = formatCurrency(totalMaxBrl, 'BRL');
      const totalRangeDisplay = totalMinBrl === totalMaxBrl 
        ? `${totalMinDisplay} (fixo)`
        : `${totalMinDisplay} - ${totalMaxDisplay}`;
      
      const totalConvertedRange = totalMinBrl === totalMaxBrl
        ? `${currency.symbol}${(totalMinConverted).toFixed(currency.decimals)} (fixo)`
        : `${currency.symbol}${(totalMinConverted).toFixed(currency.decimals)} - ${currency.symbol}${(totalMaxConverted).toFixed(currency.decimals)}`;
      
      totalHtml = `
        <div class="service-values service-values--total">
          <div class="service-values__header">
            <span class="service-values__name">TOTAL</span>
          </div>
          <div class="service-values__range">
            <strong>Em BRL:</strong> ${totalRangeDisplay}
          </div>
          <div class="service-values__converted">
            <strong>${currency.code}:</strong> ${totalConvertedRange}
          </div>
        </div>
      `;
    }

    const rateDisplay = currency.code === 'JPY' 
      ? rate.toFixed(2)
      : rate.toFixed(4);

    resultDiv.innerHTML = `
      <div class="result-converted-info">
        <span class="label">Valores em</span>
        <span class="currency-code">${currency.code}</span>
        <span class="currency-name">${currency.name}</span>
        
        <div class="exchange-rate">
          Taxa de Câmbio: 1 BRL = ${rateDisplay} ${currency.code}
          <span class="source">(taxa atual)</span>
        </div>
      </div>
      
      <div class="result-divider"></div>
      
      <div class="services-results">
        ${servicesHtml}
        ${totalHtml}
      </div>
      
      <div class="btn-group">
        <button type="button" class="btn btn--secondary" id="btn-clear">Limpar</button>
      </div>
    `;

    document.getElementById('btn-clear').addEventListener('click', handleClear);
    
    resultDiv.classList.add('result-card--visible');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  }

  function hideLoading() {
    elements.loadingSpinner.classList.remove('loading--visible');
  }

  function handleClear() {
    selectedServices = [];
    
    document.querySelectorAll('.service-checkbox input').forEach(input => {
      input.checked = false;
    });
    
    elements.selectedServices.innerHTML = '';
    elements.currencySelect.value = 'USD';
    
    hideAlert();
    hideResult();
    loadExchangeRate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
