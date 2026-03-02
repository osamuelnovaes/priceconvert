const SERVICES = {
  traffico_pago: {
    id: 'traffico_pago',
    name: 'Tráfego Pago',
    description: 'Campanhas de anúncios pagos (Google Ads, Meta Ads, etc)',
    minValue: 1500,
    maxValue: 2000,
    unit: null,
    category: 'marketing'
  },
  redes_sociais: {
    id: 'redes_sociais',
    name: 'Gestão de Redes Sociais',
    description: 'Gestão completa de redes sociais',
    minValue: 1000,
    maxValue: 1500,
    unit: null,
    category: 'marketing'
  },
  edicao_video: {
    id: 'edicao_video',
    name: 'Edição de Vídeo',
    description: 'Edição de vídeos profissionais',
    minValue: 100,
    maxValue: 250,
    unit: 'minuto',
    category: 'producao'
  },
  identidade_visual: {
    id: 'identidade_visual',
    name: 'Criação de Identidade Visual',
    description: 'Desenvolvimento de marca e identidade visual completa',
    minValue: 2500,
    maxValue: 2500,
    unit: null,
    category: 'design'
  },
  design_arte: {
    id: 'design_arte',
    name: 'Criação de Design/Arte',
    description: 'Criação de artes gráficas',
    minValue: 100,
    maxValue: 250,
    unit: 'arte',
    category: 'design'
  },
  landing_page: {
    id: 'landing_page',
    name: 'Landing Page',
    description: 'Criação de página de captura/vendas',
    minValue: 2000,
    maxValue: 2500,
    unit: null,
    category: 'desenvolvimento'
  },
  crm: {
    id: 'crm',
    name: 'CRM',
    description: 'Implementação e configuração de CRM',
    minValue: 2000,
    maxValue: 2500,
    unit: null,
    category: 'desenvolvimento'
  },
  sistema: {
    id: 'sistema',
    name: 'Criação de Sistema',
    description: 'Desenvolvimento de sistemas sob demanda',
    minValue: null,
    maxValue: null,
    unit: null,
    category: 'desenvolvimento'
  },
  automacao_ia: {
    id: 'automacao_ia',
    name: 'Automação com IA',
    description: 'Automação de processos utilizando Inteligência Artificial',
    minValue: 1500,
    maxValue: 2000,
    unit: null,
    category: 'tecnologia'
  },
  estrategia_marketing: {
    id: 'estrategia_marketing',
    name: 'Estratégia de Marketing',
    description: 'Desenvolvimento de estratégia completa de marketing',
    minValue: 3000,
    maxValue: 5000,
    unit: null,
    category: 'marketing'
  }
};

const CURRENCIES = {
  USD: { code: 'USD', name: 'Dólar Americano', symbol: '$', decimals: 2, awesomeApi: 'USD-BRL' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, awesomeApi: 'EUR-BRL' },
  GBP: { code: 'GBP', name: 'Libra Esterlina', symbol: '£', decimals: 2, awesomeApi: 'GBP-BRL' },
  CAD: { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', decimals: 2, awesomeApi: 'CAD-BRL' },
  AUD: { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', decimals: 2, awesomeApi: 'AUD-BRL' },
  JPY: { code: 'JPY', name: 'Iene Japonês', symbol: '¥', decimals: 0, awesomeApi: 'JPY-BRL' }
};

const CURRENCY_LIST = [
  { code: 'USD', name: 'Dólar Americano ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'Libra Esterlina (£)' },
  { code: 'CAD', name: 'Dólar Canadense (C$)' },
  { code: 'AUD', name: 'Dólar Australiano (A$)' },
  { code: 'JPY', name: 'Iene Japonês (¥)' }
];
