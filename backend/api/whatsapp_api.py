from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

import os
import requests

whatsapp_bp = Blueprint(
    "whatsapp",
    __name__,
    url_prefix="/api/whatsapp"
)


@whatsapp_bp.route("/send-message", methods=["POST"])
@jwt_required()
def send_message():

    try:

        data = request.get_json()

        mobile = data.get("mobile")
        message = data.get("message")

        token = os.getenv("WHATSAPP_TOKEN")
        phone_id = os.getenv("WHATSAPP_PHONE_ID")

        url = (
            f"https://graph.facebook.com/v22.0/"
            f"{phone_id}/messages"
        )

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": mobile,
            "type": "text",
            "text": {
                "body": message
            }
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        return jsonify({
            "success": True,
            "response": response.json()
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
@whatsapp_bp.route(
    "/payment-reminder",
    methods=["POST"]
)
@jwt_required()
def payment_reminder():

    data = request.get_json()

    mobile = data["mobile"]

    customer = data["customer_name"]

    amount = data["amount"]

    message = (
        f"Dear {customer},\n"
        f"Your pending amount is ₹{amount}.\n"
        f"Please make payment.\n"
        f"Thank You."
    )

    return jsonify({
        "mobile": mobile,
        "message": message
    })