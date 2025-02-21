from flask import Flask, request, jsonify
from AI_Agent_chatbot import chatbot
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    print(user_input)
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    
    # Get the response from the chatbot
    response = chatbot(user_input)
    print(response)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)