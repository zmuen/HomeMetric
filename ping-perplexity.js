// Example of using the Perplexity API to get a response
const axios = require('axios');

const PERPLEXITY_API_KEY = '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';
const baseURL = 'https://api.perplexity.ai';

async function getResponseFromPerplexity() {
    const data = {
        model: "mistral-7b-instruct",
        messages: [
            {
                role: "system",
                content: "You are an artificial intelligence assistant and you need to engage in a helpful, detailed, polite conversation with a user."
            },
            {
                role: "user",
                content: "How many stars are in the universe?"
            }
        ]
    };

    try {
        const response = await axios({
            method: 'post',
            url: `https://api.perplexity.ai`,
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: data
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

getResponseFromPerplexity();
