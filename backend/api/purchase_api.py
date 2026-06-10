from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from database import db

from models.purchase import Purchase
from models.purchase_item import PurchaseItem
from models.product import Product

from datetime import datetime

purchase_bp = Blueprint(
    "purchase",
    __name__,
    url_prefix="/api/purchases"
)
@purchase_bp.route("", methods=["POST"])
@jwt_required()
def create_purchase():

    try:

        data = request.get_json()

        purchase = Purchase(
            purchase_no=data.get("purchase_no"),
            supplier_id=data.get("supplier_id"),
            purchase_date=datetime.strptime(
                data.get("purchase_date"),
                "%Y-%m-%d"
            ).date(),
            subtotal=data.get("subtotal"),
            gst_amount=data.get("gst_amount"),
            total_amount=data.get("total_amount"),
            payment_status=data.get(
                "payment_status",
                "pending"
            )
        )

        db.session.add(purchase)
        db.session.flush()

        items = data.get("items", [])

        for item in items:

            purchase_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                total=item["total"]
            )

            db.session.add(purchase_item)

            # STOCK INCREASE
            product = Product.query.get(
                item["product_id"]
            )

            if product:
                product.stock_qty += item["quantity"]

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Purchase Added Successfully",
            "purchase_id": purchase.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
@purchase_bp.route("", methods=["GET"])
@jwt_required()
def get_purchases():

    purchases = Purchase.query.all()

    return jsonify([
        purchase.to_dict()
        for purchase in purchases
    ])
@purchase_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_purchase(id):

    purchase = Purchase.query.get_or_404(id)

    return jsonify(
        purchase.to_dict()
    )
@purchase_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_purchase(id):

    purchase = Purchase.query.get_or_404(id)

    db.session.delete(purchase)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Purchase Deleted"
    })
