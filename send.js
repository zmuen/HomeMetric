const { start } = require("repl");

function fetchProperties() {
    const location = document.getElementById('locationInput').value;
    const priceRange = document.getElementById('priceRange').value;
    const propertyType = document.getElementById('propertyType').value;
    const beds = document.getElementById('beds').value;
    const baths = document.getElementById('baths').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Check if the "Flexible" checkboxes are checked
    const flexibleStartDate = document.getElementById('flexibleStartDate').checked;
    const flexibleEndDate = document.getElementById('flexibleEndDate').checked;

    const requestBody = {
        location,
        priceRange,
        propertyType,
        beds,
        baths,
        startDate,
        endDate
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(properties => {
            displayMap(properties);
            displayRecommendations(properties);
        })
        .catch(error => console.error('Error fetching properties:', error));
}
