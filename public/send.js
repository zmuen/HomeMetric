function fetchProperties() {
    console.log('Sending request to backend...');

    const location = document.getElementById('locationInput').value;
    const priceRange = document.getElementById('priceRange').value;
    const propertyType = document.getElementById('propertyType').value;
    const beds = document.getElementById('beds').value;
    const baths = document.getElementById('baths').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const flexibleStartDate = document.getElementById('flexibleStartDate').checked;
    const flexibleEndDate = document.getElementById('flexibleEndDate').checked;

    const requestBody = {
        location,
        priceRange,
        propertyType,
        beds,
        baths,
        startDate,
        endDate,
        flexibleStartDate,
        flexibleEndDate
    };

    fetch('/api/recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        console.log('Received response from backend:', response);
        if (response.ok) {
            return response.json();
        } else {
            // Handle non-2xx HTTP responses
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    })
    .then(properties => {
        console.log('Properties received from backend:', properties);
        if (Array.isArray(properties)) {
            // Fetch livability scores for each property
            console.log('Fetching livability scores for each property...');
            return Promise.all(properties.map(property => fetchLivabilityScores(property.neighborhood)))
                .then(livabilityScores => {
                    console.log('Livability scores received from backend:', livabilityScores);
                    // Combine properties and livability scores
                    const propertiesWithScores = properties.map((property, index) => ({
                        ...property,
                        livability: livabilityScores[index] // Add livability scores to each property
                    }));
                    console.log('Properties with livability scores:', propertiesWithScores);
                    displayRecommendations(propertiesWithScores);
                });
        } else {
            console.error('Received data is not an array:', properties);
            return []; // Return empty array if properties are not received
        }
    })
    .catch(error => {
        console.error('Error fetching properties:', error);
        // Optionally handle errors in UI, e.g., display error message to the user
    });
}

// Send a request to the backend to fetch the livability scores
function fetchLivabilityScores(neighbourhood) {
    console.log('Sending request to Perplexity AI for neighbourhood:', neighbourhood);

    return fetch('/get-livability', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ neighbourhood: neighbourhood })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch livability scores');
        }
    })
    .then(data => {
        console.log('Livability scores received from Perplexity AI:', data);
        return data; // Return the received data
    })
    .catch(error => {
        console.error('Error fetching livability scores:', error);
        return {}; // Return empty object on error
    });
}