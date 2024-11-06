# HomeMetric
Rental Recommendation and Livability Calculator 

 ## YouTube Video https://youtu.be/oHKou246_rQ
 Here is a short video describing the process of using this application:

 ## Update 11.2024
 The livability-analysis.ipynb provides you an example on how you can utilize the livability data from the Livability.db to gain insights about the living environment you want to study.
 
 ## Objective: 
 To developed a AI-based tool that offers rental recommendations with detailed livability score for properties, aiding in informed decision-making for short-term rentals.
 Target Group: Young professionals who are looking for temporary housing for business.

 ## Core Features:
User Input Handling: Allows users to input specific property details (like time range, property type, location, bedrooms, bathrooms etc.) to generate recommendations.
Livability Scoring: Generates an overall livability score for properties using LLMs.
Interactive Dashboard and Map: User-friendly view that allows for comparisons, focusing on essential attributes and scores. Map with markers highlighting the location of the recommended property; makes it visually interesting and smooth for users to look at the area surrounding listed properties to make a decision. 

 ## Keys
You will need to get Keys for OPEANAI_API_KEY and Perplexity AI and put them in .env file.

 ## Typical Run
 A typical run first run the server with "node server.js". This should popup a browser window on port 5500.
