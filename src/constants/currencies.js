const ALLOWED_CURRENCIES = ['PKR', 'USD', 'INR', 'AED', 'GBP', 'EUR'];
const DEFAULT_CURRENCY = 'PKR';

const normalizeCurrency = (value) => {
  if (value == null) return DEFAULT_CURRENCY;
  const normalized = String(value).trim().toUpperCase();
  return normalized || DEFAULT_CURRENCY;
};

const resolveUserCurrency = (user) => normalizeCurrency(user?.currency);

const resolveTransactionCurrency = (requested, user) => {
  if (requested == null || String(requested).trim() === '') {
    return resolveUserCurrency(user);
  }
  return normalizeCurrency(requested);
};

const currencySchemaField = () => ({
  type: String,
  default: DEFAULT_CURRENCY,
  enum: {
    values: ALLOWED_CURRENCIES,
    message: '{VALUE} is not a supported currency'
  },
  uppercase: true,
  trim: true
});

module.exports = {
  ALLOWED_CURRENCIES,
  DEFAULT_CURRENCY,
  normalizeCurrency,
  resolveUserCurrency,
  resolveTransactionCurrency,
  currencySchemaField
};
