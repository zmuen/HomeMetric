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
    .then(response => {
        console.log('Received response from backend:', response); // Log after receiving the response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(properties => {
        console.log('Properties received from backend:', properties); // Log the actual data
        displayMap([properties]); // Make sure to wrap it in an array if needed
        displayRecommendations([properties]); // Make sure to wrap it in an array if needed
    })
    .catch(error => console.error('Error fetching properties:', error)); // Log any errors    
}
