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
        "content": ("Can you provide the average violent and property crime rate in 550 Memorial Dr. Cambridge, MA based on FBI Uniform Crime Reporting program over the last decade in the format: (# per 100000 residents). Also check and provide the air quality index (AQI) of 550 Memorial Dr. Cambridge, MA from the EPA AirNow platform compulsorily. Just give me the 3 lines of concise output without any extra words or sentences."),

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
print(response)

#string1 = str(response.choices[0].message.content)
string1 = str(response.choices[0].message.content)
print(string1)

# demo chat completion with streaming
#response_stream = client.chat.completions.create(
#    model="mistral-7b-instruct",
#    messages=messages,
#    stream=True,
#)
#for response in response_stream:
#    print(response)