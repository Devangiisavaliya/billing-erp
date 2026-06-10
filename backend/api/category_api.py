from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from database import db
from models.category import Category

category_bp = Blueprint(
    "category",
    __name__,
    url_prefix="/api/categories"
)
@category_bp.route("", methods=["POST"])
@jwt_required()
def add_category():

    data = request.get_json()

    category = Category(
        category_name=data.get("category_name"),
        description=data.get("description")
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Category Added Successfully"
    }), 201
@category_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():

    categories = Category.query.all()

    return jsonify([
        category.to_dict()
        for category in categories
    ])
@category_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_category(id):

    category = Category.query.get_or_404(id)

    return jsonify(
        category.to_dict()
    )
@category_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_category(id):

    category = Category.query.get_or_404(id)

    data = request.get_json()

    category.category_name = data.get(
        "category_name",
        category.category_name
    )

    category.description = data.get(
        "description",
        category.description
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Category Updated"
    })
@category_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_category(id):

    category = Category.query.get_or_404(id)

    db.session.delete(category)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Category Deleted"
    })
    