from flask import Flask, request, jsonify
from Extracter import extract
import os

app = Flask(__name__)

@app.route('/api/ocr', methods=['POST'])
def ocr_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    file_path = "temp_bill.png"
    file.save(file_path)

    result = extract(file_path)

    os.remove(file_path)  # cleanup
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=7000, debug=True)
