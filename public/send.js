function fetchProperties() {
    console.log('Sending request to backend...'); // Log before sending the request

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
        flexibleStartDate,
        endDate,
        flexibleEndDate
    };

    // Add flexible start and end date options to the request body
    requestBody.flexibleStartDate = flexibleStartDate;
    requestBody.flexibleEndDate = flexibleEndDate;

    // Send user input to backend
    fetch('/api/recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Properties received from backend:', data); // Log the actual data
        if (Array.isArray(data)) {
            // If the backend sends an array, use it as-is.
            displayMap(data);
            displayRecommendations(data);
        } else {
            // If the backend sends a single object, create an array with that object.
            displayMap([data]);
            displayRecommendations([data]);
        }
    })
    .catch(error => console.error('Error fetching properties:', error));
}

// Send a request to the backend to fetch the livability scores
function fetchLivabilityScores(neighbourhood) {
    fetch('/get-livability', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ neighbourhood: neighbourhood })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Livability scores:', data);
    })
    .catch(error => console.error('Error fetching livability scores:', error));
}