from flask import Flask, request, jsonify
import whisper
import os
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)


model = whisper.load_model('base')
executor = ThreadPoolExecutor(max_workers=4)

def transcribe_audio(file_path):
    result = model.transcribe(file_path)
    transcription = result['text']
    os.remove(file_path)
    return transcription


@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file found'}), 400
    
    audio_file = request.files['audio']
    audio_path = os.path.join('uploads', audio_file.filename)
    audio_file.save(audio_path)
    
    future = executor.submit(transcribe_audio, audio_path)
    transcription = future.result()
    return jsonify({'transcription': transcription}), 200



if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True, port= 5000)