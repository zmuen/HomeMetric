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

neighbourhood = "Cambridgeport, Cambridge, MA, 02139"

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
        "content": f"Give me the livability scores (integer type) for each of the categories: [amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools and user_ratings, overall_livability] for the neighbourhood: ${neighbourhood} from Area Vibes website. If a particular category is not available, please return a score of 0"
    },
]

client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

# Check if the address already exists in the database
conn = sqlite3.connect('livability.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS livability
             (neighbourhood TEXT, amenities INTEGER, commute INTEGER, cost_of_living INTEGER, crime INTEGER, employment INTEGER, health_safety INTEGER, housing INTEGER, schools INTEGER, user_ratings INTEGER, overall_livability INTEGER)''')

c.execute("SELECT * FROM livability WHERE neighbourhood = ?", (neighbourhood,))
result = c.fetchone()

if result:
    # Print the corresponding row from the database
    print(f"The livability scores for the neighbourhood '{neighbourhood}' from Area Vibes website are as follows:")
    print(f"- Amenities: {result[1]}")
    print(f"- Commute: {result[2]}")
    print(f"- Cost of Living: {result[3]}")
    print(f"- Crime: {result[4]}")
    print(f"- Employment: {result[5]}")
    print(f"- Health & Safety: {result[6]}")
    print(f"- Housing: {result[7]}")
    print(f"- Schools: {result[8]}")
    print(f"- User Ratings: {result[9]}")
    print(f"- Overall Livability: {result[10]}")
else:
    # Proceed to ping the API and the rest of the code
    response = client.chat.completions.create(
        model="sonar-small-chat",
        messages=messages,
    )

    data = response.choices[0].message.content.strip()

    # Format the response as a JSON object
    response_json = json.dumps({"answer": data})

    # Parse the JSON data
    data = json.loads(response_json)
    answer = data['answer']

    # Split the answer into individual lines
    lines = answer.split('\n')
    print(lines)

    # Initialize the variables
    amenities = 0
    commute = 0
    cost_of_living = 0
    crime = 0
    employment = 0
    health_safety = 0
    housing = 0
    schools = 0
    user_ratings = 0
    overall_livability = 0

    # Parse the response and update the variables
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
                elif category == 'Overall livability':
                    overall_livability = score

    c.execute("INSERT INTO livability (neighbourhood, amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings, overall_livability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
              (neighbourhood, amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings, overall_livability))

    conn.commit()

conn.close()