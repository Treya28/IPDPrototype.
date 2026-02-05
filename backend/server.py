from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Load tools database
def load_tools():
    try:
        with open('tools.json', 'r') as f:
            return json.load(f)['tools']
    except:
        # Fallback tools list
        return [
            {
                "id": 1,
                "name": "ChatGPT",
                "description": "General-purpose AI assistant",
                "url": "https://chat.openai.com",
                "categories": ["general"]
            }
        ]

tools = load_tools()

def analyse_task(task_description):
    """
    Analyse task and recommend appropriate AI tool.
    In production, you would use ML/NLP here.
    """
    task_lower = task_description.lower()
    
    # Simple rule-based classifier (replace with ML model in production)
    if any(word in task_lower for word in ['image', 'picture', 'photo', 'draw', 'visual']):
        return find_tool_by_category('image-generation') or find_tool_by_name('midjourney')
    
    elif any(word in task_lower for word in ['code', 'program', 'developer', 'function', 'algorithm']):
        return find_tool_by_category('coding') or find_tool_by_name('github copilot')
    
    elif any(word in task_lower for word in ['video', 'film', 'movie', 'animate']):
        return find_tool_by_category('video') or find_tool_by_name('runway')
    
    elif any(word in task_lower for word in ['music', 'audio', 'sound', 'song']):
        return find_tool_by_category('audio') or find_tool_by_name('audialab')
    
    # Default to general AI tool
    return None

def find_tool_by_category(category):
    for tool in tools:
        if 'categories' in tool and category in tool['categories']:
            return tool
    return None

def find_tool_by_name(name):
    for tool in tools:
        if name.lower() in tool['name'].lower():
            return tool
    return None

@app.route('/analyze', methods=['POST'])
def analyse():
    data = request.json
    task = data.get('task', '')
    
    if not task:
        return jsonify({'error': 'No task provided'}), 400
    
    recommended_tool = analyse_task(task)
    
    if recommended_tool:
        return jsonify({
            'recommended': True,
            'tool': recommended_tool
        })
    else:
        return jsonify({
            'recommended': False,
            'message': 'Use general AI tool'
        })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

@app.route('/tools', methods=['GET'])
def get_tools():
    return jsonify({'tools': tools})

# @app.route('/optimise-prompt', methods=['POST'])
# def optimise_prompt():
#     """Enhance and optimise user prompts using AI"""
#     data = request.json
#     prompt = data.get('prompt', '')
#     template_type = data.get('template_type', '')
    
#     if not prompt:
#         return jsonify({'error': 'No prompt provided'}), 400
    
#     # Simple optimisation rules (in production, use GPT API)
#     optimised = prompt
    
#     # Add quality enhancers for image prompts
#     if 'image' in template_type.lower():
#         if 'photorealistic' not in optimised.lower():
#             optimised += ", photorealistic, high quality, detailed"
#         if '8K' not in optimised.upper():
#             optimised += ", 8K resolution"
    
#     # Add structure for code prompts
#     elif 'code' in template_type.lower():
#         if 'step by step' not in optimised.lower():
#             optimised += "\n\nPlease explain step by step."
    
#     return jsonify({
#         'original': prompt,
#         'optimised': optimised,
#         'improvements': ['Added quality modifiers', 'Improved structure']
#     })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7700, debug=True)