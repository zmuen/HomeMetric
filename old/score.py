# Try to store the scores in a DB

# Explanation for this document: We are trying to get livability scores (all parameters: amenities, commute, cost of living, crime, employment, health & safety, housing, schools and user ratings) from Area Vibes based on the address input from the user and store them in a database. New requests will be retreived from the Perplexity API and stored in the database. Addresses which have already been searched and exists in the database will be accessed directly without having to make the API call. We will finally store the scores in a SQLite database using the sqlite3 library.

#Steps: 
# 1) Ping Perplexity to get Area Vibes scores
# 2) We have the code to retrieve.. or maybe not.. check the format of getting data from the API
# 3) Create a database and a table to store the scores

import json
import sqlite3
from openai import OpenAI

YOUR_API_KEY = "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"

address = "100 Memorial Drive, Cambridge, MA, 02139"

messages = [
    {
        "role": "system",
        "content": (
            "You are an artificial intelligence assistant and you need to "
            "give me an appropriate answer to my question."
        ),
    },
    {
        "role": "user",
        "content": f"Give me the livability scores (integer type) for each of the categories: [amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools and user_ratings] for the address: ${address} from Area Vibes website" 
        #in the format as described below: Return the response in the following JSON format: {amenities, commute, #cost of living, crime, employment, health & safety, housing, schools and user ratings}"
    },
]

client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

response = client.chat.completions.create(
     model="sonar-small-chat",
     messages=messages,
 )
#print(type(response))

data = response.choices[0].message.content.strip()

# Format the response as a JSON object
response_json = json.dumps({"answer": data})

# Print the JSON object
#print(response_json)

# Parse the JSON data
data = json.loads(response_json)
answer = data['answer']

# Split the answer into individual lines
lines = answer.split('\n')
print(lines)

# Create a SQLite3 database and table
import sqlite3

conn = sqlite3.connect('livability.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS livability
             (address TEXT, amenities INTEGER, commute INTEGER, cost_of_living INTEGER, crime INTEGER, employment INTEGER, health_safety INTEGER, housing INTEGER, schools INTEGER, user_ratings INTEGER)''')

# Insert the address and scores into the table
#address = "550 Memorial Drive, Cambridge, MA, 02139"

#lines = ['The livability scores for the address "550 Memorial Drive, Cambridge, MA, 02139" from Area Vibes website are as follows:', '', '- Amenities: 85', '- Commute: 85', '- Cost of living: 75', '- Crime: 65', '- Employment: 95', '- Health & safety: 90', '- Housing: 75', '- Schools: 90', '- User ratings: 90']

for line in lines:
    if '- ' in line and ':' in line:
        category_score = line.split(': ')
        if len(category_score) == 2:
            category = category_score[0].strip('- ')
            score = int(category_score[1])
            
            if category == 'Amenities':
                amenities = score
            elif category == 'Commute':
                commute = score
            elif category == 'Cost of Living':
                cost_of_living = score
            elif category == 'Crime':
                crime = score
            elif category == 'Employment':
                employment = score
            elif category == 'Health & Safety':
                health_safety = score
            elif category == 'Housing':
                housing = score
            elif category == 'Schools':
                schools = score
            elif category == 'User Ratings':
                user_ratings = score

c.execute("INSERT INTO livability (address, amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
          (address, amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings))

conn.commit()
conn.close()