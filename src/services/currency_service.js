const { ValidationError } = require('../utils/errors');

class CurrencyService {
  constructor() {
    this.currencies = {
      USD: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        exchangeRate: 1,
      },
      EUR: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        exchangeRate: 1.18,
      },
      AUD: {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        exchangeRate: 0.74,
      },
    };
  }

  /**
   * Get an array of valid currencies
   *
   * @returns {Array} An array of valid currencies
   */
  validCurrencies() {
    return Object.keys(this.currencies);
  }

  /**
   * Check if a currency is valid
   *
   * @param {string} currency
   * @returns {boolean} true if currency is valid
   * @throws {ValidationError} if currency is invalid
   */
  isValidCurrency(currency) {
    if (!currency) {
      throw new ValidationError('Currency is required');
    }

    if (typeof currency !== 'string') {
      throw new ValidationError('Currency must be a string');
    }

    if (!this.currencies[currency]) {
      throw new ValidationError(
        `Invalid currency: ${currency}. This service only supports ${this.validCurrencies().join(', ')}`,
      );
    }

    return true;
  }

  /**
   *
   * @param {String} fromCurrency
   * @param {String} toCurrency
   * @returns {Number} the exchange rate
   */
  getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1;
    }
    return (
      this.currencies[fromCurrency].exchangeRate /
      this.currencies[toCurrency].exchangeRate
    );
  }

  /**
   *
   * @param {Number} amount
   * @param {String} fromCurrency
   * @param {String} toCurrency
   * @returns {Number} the converted amount
   */
  convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);
    return Math.floor(amount * exchangeRate);
  }
}

module.exports = CurrencyService;
