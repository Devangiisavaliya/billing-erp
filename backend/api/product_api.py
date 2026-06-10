from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required
import flask_jwt_extended
from database import db
from models.product import Product

product_bp = Blueprint(
    "product",
    __name__,
    url_prefix="/api/products"
)
@product_bp.route("", methods=["POST"])
@jwt_required()
def add_product():

    data = request.get_json()

    product = Product(
        
        product_code=data.get("product_code"),
        barcode=data.get("barcode"),
        product_name=data.get("product_name"),
        category_id=data.get("category_id"),
        hsn_code=data.get("hsn_code"),
        purchase_price=data.get("purchase_price"),
        selling_price=data.get("selling_price"),
        gst_percent=data.get("gst_percent"),
        stock_qty=data.get("stock_qty"),
        low_stock_limit=data.get("low_stock_limit")
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product Added Successfully"
    }), 201
@product_bp.route("", methods=["GET"])
@jwt_required()
def get_products():

    products = Product.query.all()

    return jsonify([
        product.to_dict()
        for product in products
    ])
@product_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_product(id):

    product = Product.query.get_or_404(id)

    return jsonify(
        product.to_dict()
    )
@product_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_product(id):

    product = Product.query.get_or_404(id)

    data = request.get_json()

    product.product_name = data.get(
        "product_name",
        product.product_name
    )

    product.selling_price = data.get(
        "selling_price",
        product.selling_price
    )

    product.stock_qty = data.get(
        "stock_qty",
        product.stock_qty
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product Updated"
    })
@product_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_product(id):

    product = Product.query.get_or_404(id)

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product Deleted"
    })
@product_bp.route("/search")
@jwt_required()
def search_product():

    q = request.args.get("q")

    products = Product.query.filter(
        Product.product_name.like(f"%{q}%")
    ).all()

    return jsonify([
        {
            "id": p.id,
            "product_name": p.product_name,
            "barcode": p.barcode,
            "price": p.selling_price
        }
        for p in products
    ])
    
@product_bp.route("/barcode/<barcode>", methods=["GET"])
@jwt_required()
def get_product_by_barcode(barcode):

    product = Product.query.filter_by(
        barcode=barcode
    ).first()

    if not product:

        return jsonify({
            "success": False,
            "message": "Product Not Found"
        }), 404

    return jsonify(
        product.to_dict()
    )