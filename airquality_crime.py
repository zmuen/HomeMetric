import requests

# Set up API endpoint and headers
base_url = "https://api.perplexity.ai/v1"
headers = {
    "Authorization": "Bearer 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"
}

# Function to get crime data
def get_crime_data(location):
    endpoint = f"{base_url}/crime"
    params = {
        "location": location
    }
    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# Function to get air quality data
def get_air_quality_data(location):
    endpoint = f"{base_url}/air-quality"
    params = {
        "location": location
    }
    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# Example usage
location = "Cambridge, MA"
crime_data = get_crime_data(location)
air_quality_data = get_air_quality_data(location)

print(f"Crime data for {location}:")
print(crime_data)

print(f"\nAir quality data for {location}:")
print(air_quality_data)


# Here's how the code works:
# We import the requests library to make HTTP requests to the Perplexity API.
# We set up the base URL for the Perplexity API and the headers required for authentication. Replace YOUR_API_KEY_HERE with your actual API key.
# We define two functions: get_crime_data and get_air_quality_data. These functions take a location parameter and make a GET request to the respective API endpoints (/crime and /air-quality), passing the location as a query parameter.
# The functions use the requests.get method to make the API request, passing the headers and query parameters. If the request is successful, the function returns the JSON response data.
# In the example usage section, we provide a location (in this case, "Cambridge, MA") and call the get_crime_data and get_air_quality_data functions with that location.
# Finally, we print the crime data and air quality data returned by the API.
# Note that this code assumes that the Perplexity API endpoints /crime and /air-quality exist and accept a location parameter. You may need to adjust the code based on the actual API documentation and requirements.