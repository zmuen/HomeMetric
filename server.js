require('dotenv').config(); // Load environment variables if using locally with dotenv

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Function to geocode address using Google Maps Geocoding API
const geocodeAddress = async (address) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { latitude: location.lat, longitude: location.lng };
        }
        return null;
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
};

// POST route to handle user input and fetch recommendations from OpenAI
app.post('/api/recommendations', async (req, res) => {
    try {
        const { location, priceRange, propertyType, beds, baths, startDate, endDate, flexibleStartDate, flexibleEndDate } = req.body;

        // Construct the request to OpenAI API
        const requestBody = {
            prompt: `Task: Search for properties based on the following preferences.
            Location: ${location}
            Price Range: ${priceRange}
            Property Type: ${propertyType}
            Beds: ${beds}
            Baths: ${baths}
            Start Date: ${startDate}
            End Date: ${endDate}
            Flexible Start Date: ${flexibleStartDate}
            Flexible End Date: ${flexibleEndDate}
            Output Format:
            Return each property in the following JSON format:
            {title: "Title of the property", description: "Description of the property", address: "Address of the property", price: "Price of the property", link: "Link to the property listing"}
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
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Access API key from environment variables
            },
            body: JSON.stringify(requestBody)
        });

        if (!openAIResponse.ok) {
            throw new Error(`OpenAI API error! status: ${openAIResponse.status}`);
        }

        const recommendations = await openAIResponse.json();

        // Geocode addresses from recommendations
        for (const property of recommendations) {
            const { address } = property;
            const { latitude, longitude } = await geocodeAddress(address);
            property.latitude = latitude;
            property.longitude = longitude;
        }

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


// Code for obtaining Airbnb coordinates:

// from selenium import webdriver
// from selenium.webdriver.chrome.options import Options 
// import time
// from bs4 import BeautifulSoup
// import urllib.parse as urlparse
// from urllib.parse import parse_qs

// def main():
//     chrome_options = Options()  
//     chrome_options.add_argument("--headless")  #if you don't want the GUI to pop up
//     driver = webdriver.Chrome(options=chrome_options)
//     driver.get('https://www.airbnb.co.uk/rooms/15307317')
//     time.sleep(2)
//     soup = BeautifulSoup(driver.page_source, "lxml")
//     url = (soup.find("img", {"data-veloute":"map/GoogleMapStatic"})).attrs['src']
//     parsed = urlparse.urlparse(url)
//     print(parse_qs(parsed.query)['center'])

// if __name__ == '__main__':
//     main()