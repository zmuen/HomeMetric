function fetchProperties() {
    const location = document.getElementById('locationInput').value;
    const priceRange = document.getElementById('priceRange').value;
    const propertyType = document.getElementById('propertyType').value;
    const area = document.getElementById('areaInput').value;

    // Send user input to backend
    fetch('/get-recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, priceRange, propertyType, area }),
    })
        .then(response => response.json())
        .then(properties => {
            displayRecommendations(properties);
        })
        .catch(error => console.error('Error fetching properties:', error));
}