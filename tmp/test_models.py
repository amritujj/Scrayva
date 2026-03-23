import google.generativeai as genai
import os

key = "AIzaSyDZ6g9bH5v56h35GCrIpBpdXGagB_7gPuk"
genai.configure(api_key=key)

print("Listing models available for this API key...")
try:
    models = list(genai.list_models())
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Failed to query Models: {e}")
