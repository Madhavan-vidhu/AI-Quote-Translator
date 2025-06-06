from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os # os is technically not needed if you hardcode, but keeping it for completeness

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

# Configure Google Gemini API
# !!! WARNING: HARDCODING API KEYS IS NOT RECOMMENDED FOR PRODUCTION ENVIRONMENTS !!!
# !!! This is for demonstration purposes only, and you should use environment variables
# !!! or a secrets management service in a real application.
YOUR_GEMINI_API_KEY = "GEMINI_API_KEY" # <-- REPLACE THIS with your actual API key

genai.configure(api_key=YOUR_GEMINI_API_KEY)


@app.route('/transform_quote', methods=['POST'])
def transform_quote():
    data = request.get_json()
    quote = data.get('quote')
    style = data.get('style')

    if not quote or not style:
        return jsonify({"error": "Quote and style are required"}), 400

    prompt = f"Translate the following quote into {style} style: '{quote}'"

    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        transformed_quote = response.text
        return jsonify({"transformed_quote": transformed_quote})
    except Exception as e:
        # A more generic error handling since API key is now hardcoded
        # and "API key missing" is less likely to be the direct cause
        print(f"Error during API call: {e}") # Log the full error on the server
        return jsonify({"error": "An error occurred during translation. Please try again."}), 500

if __name__ == '__main__':
    # No need to print environment variable instructions if hardcoding
    app.run(debug=True, port=5000)