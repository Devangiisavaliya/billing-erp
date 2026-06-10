from flask import Blueprint
from flask import request
from flask import jsonify

from database import db
from models.user import User

from flask_jwt_extended import (
    create_access_token
)

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    full_name = data.get("full_name")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "staff")

    user_exists = User.query.filter_by(
        username=username
    ).first()

    if user_exists:
        return jsonify({
            "success": False,
            "message": "Username already exists"
        }), 400

    user = User(
        full_name=full_name,
        username=username,
        role=role
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User created successfully"
    })
    
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    if not user.check_password(password):
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return jsonify({
        "success": True,
        "token": token,
        "role": user.role,
        "username": user.username
    })