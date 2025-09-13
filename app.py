import os
import random
from flask import Flask, request, jsonify, render_template_string
import google.generativeai as genai

# --- 1. Flask Initialization ---
app = Flask(__name__)

# Gemini API Key setup
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    genai.configure(api_key=api_key)
except ValueError as e:
    print(e)
    pass


# --- 2. Scenarios (English, Expanded) ---

SCENARIOS = [
    {
        "id": 1,
        "title": "🚀 Anticipation of a New Product Launch",
        "content": "A company called 'Techtron' is rumored to unveil a groundbreaking product next month. You expect the stock price to rise significantly. How would you invest?"
    },
    {
        "id": 2,
        "title": "📉 Rising Competition Threat",
        "content": "You currently own 100 shares of 'EnergySolutions' purchased at $50 each. A strong new competitor is entering the market, and you worry the stock might fall. How would you protect your investment?"
    },
    {
        "id": 3,
        "title": "💥 Uncertainty Around Earnings Report",
        "content": "'BioHealth' is about to release its quarterly earnings. The results could send the stock sharply up or down. You are not sure about the direction, but you expect extreme volatility. What strategy would you use?"
    },
    {
        "id": 4,
        "title": "🌍 Geopolitical Tensions",
        "content": "Rising geopolitical tensions in Eastern Europe are causing market uncertainty. You hold no positions yet, but expect sudden downward moves in the overall market index. How would you position yourself with options?"
    },
    {
        "id": 5,
        "title": "💡 Merger Rumor Buzz",
        "content": "News outlets are speculating that 'RetailOne' may merge with a larger competitor. If the deal goes through, the stock may skyrocket; if not, it could crash. How would you take advantage of this rumor using options?"
    },
    {
        "id": 6,
        "title": "📊 Interest Rate Announcement",
        "content": "The Federal Reserve is about to announce its decision on interest rates. Markets often react strongly to such news, but it is unclear whether the rates will rise or fall. How would you use options to prepare?"
    },
    {
        "id": 7,
        "title": "🎮 Gaming Stock Hype",
        "content": "'PixelPlay', a gaming company, is launching its long-awaited blockbuster game this week. You believe the hype could push the stock up temporarily, but you are unsure about its long-term success. What’s your play?"
    },
    {
        "id": 8,
        "title": "🛢️ Oil Price Shock",
        "content": "Due to sudden supply chain disruptions, oil prices are swinging wildly. You are considering taking a position in 'GlobalOil' but are unsure whether prices will stabilize or continue to fluctuate. How would you trade options here?"
    },
    {
        "id": 9,
        "title": "📦 Tech Stock Overvaluation?",
        "content": "'CloudNet' stock has doubled in the past 6 months. Analysts are split: some say it’s still undervalued, others warn of a bubble. You are cautious but want to explore opportunities with limited downside risk. What’s your strategy?"
    },
]


# --- 3. Strategy Mapping ---
STRATEGIES = {
    "BULLISH": {
        "name": "Long Call",
        "description": "Buying a call option gives you the right to purchase the stock at a set price in the future. You profit if the stock rises significantly.",
        "reason": "This is the most direct bullish strategy to bet on a rising stock price."
    },
    "BEARISH": {
        "name": "Long Put",
        "description": "Buying a put option gives you the right to sell the stock at a set price in the future. You profit if the stock falls sharply.",
        "reason": "This strategy benefits when you expect a stock’s value to decrease."
    },
    "HEDGING": {
        "name": "Protective Put",
        "description": "You buy a put option while holding the underlying stock to insure against downside risk. It works like an insurance policy.",
        "reason": "Protects your existing stock position from major losses."
    },
    "VOLATILITY": {
        "name": "Long Straddle",
        "description": "Buying both a call and a put option with the same strike price and expiration. Profits if the stock moves sharply in either direction.",
        "reason": "Best for situations with high uncertainty and expected volatility."
    },
    "UNCLEAR": {
        "name": "Unclear",
        "description": "The input is too vague for classification. Please clarify your intention (e.g., expecting price rise, fall, or just hedging).",
        "reason": "The AI could not determine a clear investment intention."
    }
}


# --- 4. Frontend Template ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Options Trading Simulator (Gemini)</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; color: #333; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { max-width: 700px; width: 100%; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #4285F4; text-align: center; }
        .scenario { background: #e8f0fe; border-left: 5px solid #4285F4; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
        h2 { margin-top: 0; }
        textarea { width: 100%; padding: 10px; font-size: 16px; border-radius: 5px; border: 1px solid #ccc; min-height: 100px; box-sizing: border-box; }
        button { display: block; width: 100%; padding: 12px; font-size: 18px; color: white; background-color: #4285F4; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; transition: background-color 0.2s; }
        button:hover { background-color: #3367D6; }
        #result { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .loader { text-align: center; display: none; }
        .result-card { background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin-top: 10px; }
        .result-card h3 { margin-top: 0; color: #1e8e3e; }
        .result-card.error h3 { color: #d93025; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Find Your Option Strategy (w/ Gemini) 💡</h1>
        <div class="scenario">
            <h2>Scenario {{ scenario.id }}: {{ scenario.title }}</h2>
            <p>{{ scenario.content }}</p>
        </div>
        
        <form id="strategyForm">
            <textarea id="userInput" placeholder="What would you do in this situation? Share your thoughts..." required></textarea>
            <button type="submit">Analyze Strategy</button>
        </form>

        <div id="result">
            <div class="loader">
                <p>🤖 Gemini AI is analyzing your thoughts...</p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('strategyForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const userInput = document.getElementById('userInput').value;
            const resultDiv = document.getElementById('result');
            const loader = document.querySelector('.loader');

            loader.style.display = 'block';
            resultDiv.innerHTML = '';
            resultDiv.appendChild(loader);

            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: userInput })
                });

                if (!response.ok) {
                    throw new Error('Server error occurred.');
                }

                const data = await response.json();
                
                let resultHtml = `
                    <div class="result-card ${data.strategy.name.includes('Unclear') ? 'error' : ''}">
                        <h3>AI Analysis: ${data.intent}</h3>
                        <p><strong>Reason:</strong> ${data.reason}</p>
                    </div>
                    <div class="result-card">
                        <h3>Recommended Strategy: ${data.strategy.name}</h3>
                        <p>${data.strategy.description}</p>
                        <p><strong>Why:</strong> ${data.strategy.reason}</p>
                    </div>
                `;
                resultDiv.innerHTML = resultHtml;

            } catch (error) {
                resultDiv.innerHTML = '<div class="result-card error"><h3>Error</h3><p>Something went wrong. Please check your Gemini API key.</p></div>';
            } finally {
                loader.style.display = 'none';
            }
        });
    </script>
</body>
</html>
"""


# --- 5. Backend Routes ---
@app.route("/")
def index():
    random_scenario = random.choice(SCENARIOS)
    return render_template_string(HTML_TEMPLATE, scenario=random_scenario)


@app.route("/analyze", methods=["POST"])
def analyze():
    user_input = request.json.get("text", "")
    if not user_input:
        return jsonify({"error": "No input provided."}), 400

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are a professional financial analyst. Analyze the user's input and classify the intention into one of the categories:
    [BULLISH, BEARISH, HEDGING, VOLATILITY, UNCLEAR]

    Respond strictly in the format: "CATEGORY | reason".
    Example: "BULLISH | Because the user expects the stock to rise significantly."

    User input: "{user_input}"
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        parts = response_text.split('|')
        if len(parts) == 2:
            intent_key = parts[0].strip().upper()
            reason = parts[1].strip()
        else:
            intent_key = "UNCLEAR"
            reason = "AI did not follow the expected format."

        if intent_key not in STRATEGIES:
            intent_key = "UNCLEAR"
            reason = f"AI returned an invalid category: {intent_key}"

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        intent_key = "UNCLEAR"
        reason = "Error occurred while calling AI model."

    strategy_info = STRATEGIES[intent_key]
    
    return jsonify({
        "intent": intent_key,
        "reason": reason,
        "strategy": strategy_info
    })


# --- 6. Run App ---
if __name__ == "__main__":
    app.run(debug=True, port=5001)