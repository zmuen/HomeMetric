from openai import OpenAI

YOUR_API_KEY = "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"

messages = [
    {
        "role": "system",
        "content": (
            "You are an artificial intelligence assistant and you need to "
            "engage in a helpful, detailed, polite conversation with a user."
        ),
    },
    {

        "role": "user",
        "content": "Give me the livability scores based on various categories for 550 Memorial Drive, Cambridge, MA, 02139 from Area Vibes website in the format as described below: Return the response in the following JSON format:{amenities, commute, cost of living, crime, employment, health & safety, housing, schools and user ratings}"

        #"content": ("Can you provide the average violent and property crime rate in 550 Memorial Dr. Cambridge, MA based on FBI Uniform Crime Reporting program over the last decade in the format: (# per 100000 residents). Also check and provide the air quality index (AQI) of 550 Memorial Dr. Cambridge, MA from the EPA AirNow platform compulsorily, -the reply is useless and huge to be honest")

        # "role": "user",
        # "content": (
        #     "Count to 100, with a comma between each number and no newlines. "
        #     "E.g., 1, 2, 3, ..."
        # ),
    },
]

client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

# demo chat completion without streaming
response = client.chat.completions.create(
     model="mistral-7b-instruct",
     messages=messages,
 )
#print(response)

response2 = client.chat.completions.create(
     model="sonar-small-chat",
     messages=messages,
 )
#print(response2)

response3 = client.chat.completions.create(
     model="codellama-70b-instruct",
     messages=messages,
 )
#print(response3)

#string1 = str(response.choices[0].message.content)
#string1 = str(response.choices[0].message.content)
#print(string1)

# demo chat completion with streaming
#response_stream = client.chat.completions.create(
#    model="mistral-7b-instruct",
#    messages=messages,
#    stream=True,
#)
#for response in response_stream:
#    print(response)
