require('dotenv').config(); // Load environment variables

const express = require('express');
const axios = require('axios'); // Replace node-fetch with axios
const cors = require('cors');
const path = require('path');

const { getLivability } = require('./livability');

const app = express();
const port = 5500;

// Middleware to enable CORS
app.use(cors());

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('text/javascript');
    }
    next();
});

app.post('/api/recommendations', async (req, res) => {
    try {
        // Extract user input from the request body
        const { location, priceRange, propertyType, beds, baths, startDate, flexibleStartDate, endDate, flexibleEndDate } = req.body;

        // Retrieve the OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;

        // Construct the request to OpenAI API including a system message and a user message
        const requestBody = {
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Task: Generate a realistic and actionable list of 5 properties from rental platforms in valid JSON array format based on the user preferences. The data should not be synthetic. Return the information in the following JSON format: {"name": "Name of the property", "description": "Description of the property", "neighborhood": "Neighborhood, city, two-letter state abbreviations, zip code", "location": [longitude, latitude], "price": "Price of the property", "link": "url to the property listing"}'
                },
                {
                    role: 'user',
                    content: `Location: ${location}
                    Price Range: ${priceRange}
                    Property Type: ${propertyType}
                    Beds: ${beds}
                    Baths: ${baths}
                    Start Date: ${startDate}
                    Flexible Start Date: ${flexibleStartDate}
                    End Date: ${endDate}
                    Flexible End Date: ${flexibleEndDate}`
                }
            ]
        };

        const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (openAIResponse.status !== 200) {
            throw new Error(`OpenAI API error! status: ${openAIResponse.status}`);
        }

        // Directly use the data from the response without parsing as JSON string
        let recommendedProperties = openAIResponse.data.choices[0].message.content;
        recommendedProperties = JSON.parse(recommendedProperties); // This should be 'let' if it's reassigned

        res.json(recommendedProperties);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.post('/get-livability', getLivability);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});