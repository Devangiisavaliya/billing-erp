from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from database import db
from models.product import Product

inventory_bp = Blueprint(
    "inventory",
    __name__,
    url_prefix="/api/inventory"
)
@inventory_bp.route("/stock", methods=["GET"])
@jwt_required()
def get_stock():

    products = Product.query.all()

    result = []

    for product in products:

        result.append({
            "id": product.id,
            "product_name": product.product_name,
            "stock_qty": product.stock_qty,
            "low_stock_limit": product.low_stock_limit
        })

    return jsonify(result)
@inventory_bp.route("/low-stock", methods=["GET"])
@jwt_required()
def low_stock():

    products = Product.query.all()

    result = []

    for product in products:

        if product.stock_qty <= product.low_stock_limit:

            result.append({
                "id": product.id,
                "product_name": product.product_name,
                "stock_qty": product.stock_qty
            })

    return jsonify(result)
@inventory_bp.route("/stock-in", methods=["POST"])
@jwt_required()
def stock_in():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No JSON data received"
        }), 400

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if not product_id:
        return jsonify({
            "success": False,
            "message": "product_id is required"
        }), 400

    if not quantity:
        return jsonify({
            "success": False,
            "message": "quantity is required"
        }), 400

    product = Product.query.get_or_404(product_id)

    product.stock_qty += int(quantity)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Stock Added Successfully",
        "current_stock": product.stock_qty
    })
@inventory_bp.route("/stock-out", methods=["POST"])
@jwt_required()
def stock_out():

    data = request.get_json()

    product = Product.query.get_or_404(
        data["product_id"]
    )

    qty = int(data["quantity"])

    if product.stock_qty < qty:

        return jsonify({
            "success": False,
            "message": "Insufficient Stock"
        }), 400

    product.stock_qty -= qty

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Stock Removed Successfully",
        "current_stock": product.stock_qty
    })
@inventory_bp.route("/product/<int:id>", methods=["GET"])
@jwt_required()
def product_stock(id):

    product = Product.query.get_or_404(id)

    return jsonify({
        "id": product.id,
        "product_name": product.product_name,
        "stock_qty": product.stock_qty,
        "low_stock_limit": product.low_stock_limit
    })
