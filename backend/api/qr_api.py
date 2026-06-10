import os
import cv2
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

qr_bp = Blueprint("qr", __name__, url_prefix="/api/qr")

UPLOAD_FOLDER = "uploads/qr"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@qr_bp.route("/scan", methods=["POST"])
@jwt_required()
def scan_qr():
    try:
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "message": "No file uploaded"
            }), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({
                "success": False,
                "message": "Empty filename"
            }), 400

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        img = cv2.imread(file_path)

        if img is None:
            return jsonify({
                "success": False,
                "message": "Invalid image"
            }), 400

        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(img)

        if not data:
            return jsonify({
                "success": False,
                "message": "No QR code found"
            }), 404

        return jsonify({
            "success": True,
            "data": [data]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500