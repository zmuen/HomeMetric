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
    },
]

client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

# Check if the address already exists in the database
conn = sqlite3.connect('livability.db')
c = conn.cursor()
c.execute("SELECT * FROM livability WHERE address = ?", (address,))
result = c.fetchone()

if result:
    # Print the corresponding row from the database
    print(f"The livability scores for the address '{address}' from Area Vibes website are as follows:")
    print(f"- Amenities: {result[1]}")
    print(f"- Commute: {result[2]}")
    print(f"- Cost of living: {result[3]}")
    print(f"- Crime: {result[4]}")
    print(f"- Employment: {result[5]}")
    print(f"- Health & safety: {result[6]}")
    print(f"- Housing: {result[7]}")
    print(f"- Schools: {result[8]}")
    print(f"- User ratings: {result[9]}")
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

    # Create a SQLite3 database and table
    c.execute('''CREATE TABLE IF NOT EXISTS livability
                 (address TEXT, amenities INTEGER, commute INTEGER, cost_of_living INTEGER, crime INTEGER, employment INTEGER, health_safety INTEGER, housing INTEGER, schools INTEGER, user_ratings INTEGER)''')

    # Insert the address and scores into the table
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