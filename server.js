require('dotenv').config(); // Load environment variables

const express = require('express');
const axios = require('axios'); // Replace node-fetch with axios
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5500;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Task: Search for 5 properties based on the following preferences. Each property should be returned in the following JSON format: {"name": "Name of the property", "description": "Description of the property", "neighborhood": "Neighborhood, city, state, zip code", "location": [latitude, longitude], "price": "Price of the property", "link": "url to the property listing"}'
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

        // Parse the response from OpenAI API
        const recommendedProperties = JSON.parse(openAIResponse.data.choices[0].message.content);

        console.log(recommendedProperties);

        // Send the correct array of objects back to the client
        res.json(recommendedProperties);
    } catch (error) { // Close try block correctly
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});