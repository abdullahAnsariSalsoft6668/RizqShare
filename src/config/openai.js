const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini'; // Cost-effective model
  }

  async chat(messages, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('AI service temporarily unavailable');
    }
  }

  async getFinancialAdvice(userData) {
    const prompt = `You are a financial advisor. Based on the following data, provide personalized financial advice:
    
Income: ${userData.totalIncome}
Expenses: ${userData.totalExpenses}
Donations: ${userData.totalDonations}
Donation Goal: ${userData.donationGoal}
Remaining Goal: ${userData.remainingGoal}

Provide 3-4 actionable tips to help them save money and reach their donation goals.`;

    const messages = [
      { role: 'system', content: 'You are a helpful financial advisor focused on ethical finance and charitable giving.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages);
  }

  async getDonationRecommendations(userData) {
    const prompt = `Based on this financial profile:
    
Monthly Income: ${userData.monthlyIncome}
Current Donation Percentage: ${userData.currentDonationPercentage}%
Financial Stability: ${userData.stability}

Recommend an appropriate donation percentage and suggest 2-3 causes or charities they might support.`;

    const messages = [
      { role: 'system', content: 'You are a charitable giving advisor who helps people give meaningfully and sustainably.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages);
  }

  async categorizeExpense(description, amount) {
    const prompt = `Categorize this expense into ONE of these categories: Food, Travel, Bills, Shopping, Healthcare, Education, Entertainment, Other.
    
Description: ${description}
Amount: ${amount}

Respond with only the category name.`;

    const messages = [
      { role: 'system', content: 'You are an expense categorization assistant. Respond with only the category name.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages, { max_tokens: 20, temperature: 0.3 });
  }

  async generateImpactStory(donations) {
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const causes = donations.map(d => d.recipient).join(', ');

    const prompt = `Create an inspiring, personal impact story (2-3 sentences) about someone who donated ${totalAmount} to causes including: ${causes}.`;

    const messages = [
      { role: 'system', content: 'You are a storyteller who creates meaningful narratives about charitable giving.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages, { max_tokens: 150 });
  }

  async forecastDonations(historicalData) {
    const prompt = `Based on this donation history: ${JSON.stringify(historicalData)}, predict the likely donation amount for the next 3 months. Provide your answer as a JSON array with months and predicted amounts.`;

    const messages = [
      { role: 'system', content: 'You are a financial forecasting assistant. Respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ];

    return await this.chat(messages, { temperature: 0.5 });
  }
}

module.exports = new OpenAIService();

