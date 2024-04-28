require('dotenv').config(); // Load environment variables if using locally with dotenv

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors module
const path = require('path'); // Import the path module

const app = express();
const port = 5500; // Change the port to 5500

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

// POST route to handle user input and fetch recommendations from OpenAI
app.post('/api/recommendations', async (req, res) => {
    try {
        const { location, priceRange, propertyType, beds, baths, startDate, flexibleStartDate, endDate, flexibleEndDate } = req.body;

        // Retrieve the OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;

        // Construct the request to OpenAI API
        const requestBody = {
            prompt: `Task: Search for properties based on the following preferences.
            Location: ${location}
            Price Range: ${priceRange}
            Property Type: ${propertyType}
            Beds: ${beds}
            Baths: ${baths}
            Start Date: ${startDate}
            Flexible Start Date: ${flexibleStartDate}
            End Date: ${endDate}
            Flexible End Date: ${flexibleEndDate}
            Output Format:
            Each property should be returned in the following JSON format:
            {
            "name": "Name of the property",
            "description": "Description of the property",
            "neighborhood": "Neighborhood, city, state, zip code",
            "location": [latitude, longitude],
            "price": "Price of the property",
            "link": "Link to the property listing"
            }
            `,
            max_tokens: 100,
            temperature: 0.5,
            top_p: 1,
            n: 20 // Number of recommendations
        };

        // Make a POST request to the OpenAI API
        const openAIResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Access API key from environment variables
            },
            body: JSON.stringify(requestBody)
        });

        if (!openAIResponse.ok) {
            throw new Error(`OpenAI API error! status: ${openAIResponse.status}`);
        }

        const recommendations = await openAIResponse.json();

        // Send the recommendations back to the client
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});