from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from database import db

from models.company_setting import (
    CompanySettings
)

settings_bp = Blueprint(
    "settings",
    __name__,
    url_prefix="/api/settings"
)
@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_settings():

    settings = CompanySettings.query.first()

    if not settings:

        return jsonify({
            "success": False,
            "message":
            "Company settings not found"
        }), 404

    return jsonify(
        settings.to_dict()
    )
@settings_bp.route("", methods=["PUT"])
@jwt_required()
def update_settings():

    settings = CompanySettings.query.first()

    if not settings:

        return jsonify({
            "success": False,
            "message":
            "Settings not found"
        }), 404

    data = request.get_json()

    settings.company_name = data.get(
        "company_name",
        settings.company_name
    )

    settings.address = data.get(
        "address",
        settings.address
    )

    settings.mobile = data.get(
        "mobile",
        settings.mobile
    )

    settings.email = data.get(
        "email",
        settings.email
    )

    settings.gst_number = data.get(
        "gst_number",
        settings.gst_number
    )

    settings.invoice_prefix = data.get(
        "invoice_prefix",
        settings.invoice_prefix
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "Settings Updated Successfully"
    })
