import os

from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from services.ocr_service import extract_text

ocr_bp = Blueprint(
    "ocr",
    __name__,
    url_prefix="/api/ocr"
)

UPLOAD_FOLDER = "uploads/invoices"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


@ocr_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_invoice():

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
                "message": "No file selected"
            }), 400

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(file_path)

        extracted_text = extract_text(
            file_path
        )

        return jsonify({
            "success": True,
            "filename": file.filename,
            "text": extracted_text
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500