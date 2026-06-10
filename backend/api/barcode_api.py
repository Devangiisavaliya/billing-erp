from flask import Blueprint
from flask import jsonify

from flask_jwt_extended import jwt_required

from models.product import Product

barcode_bp = Blueprint(
    "barcode",
    __name__,
    url_prefix="/api/barcode"
)
@barcode_bp.route("/<string:barcode>", methods=["GET"])
@jwt_required()
def search_barcode(barcode):

    product = Product.query.filter_by(
        barcode=barcode
    ).first()

    if not product:

        return jsonify({
            "success": False,
            "message": "Product Not Found"
        }), 404

    return jsonify({
        "success": True,
        "product": {
            "id": product.id,
            "product_code": product.product_code,
            "barcode": product.barcode,
            "product_name": product.product_name,
            "selling_price": product.selling_price,
            "gst_percent": product.gst_percent,
            "stock_qty": product.stock_qty
        }
    })
