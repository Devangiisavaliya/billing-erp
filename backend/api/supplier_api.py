from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from database import db
from models.supplier import Supplier

supplier_bp = Blueprint(
    "supplier",
    __name__,
    url_prefix="/api/suppliers"
)
@supplier_bp.route("", methods=["POST"])
@jwt_required()
def add_supplier():

    data = request.get_json()

    supplier = Supplier(
        supplier_name=data.get("supplier_name"),
        contact_person=data.get("contact_person"),
        mobile=data.get("mobile"),
        email=data.get("email"),
        address=data.get("address"),
        gst_number=data.get("gst_number")
    )

    db.session.add(supplier)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Supplier Added Successfully"
    }), 201
@supplier_bp.route("", methods=["GET"])
@jwt_required()
def get_suppliers():

    suppliers = Supplier.query.all()

    return jsonify([
        supplier.to_dict()
        for supplier in suppliers
    ])
@supplier_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_supplier(id):

    supplier = Supplier.query.get_or_404(id)

    return jsonify(
        supplier.to_dict()
    )
@supplier_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_supplier(id):

    supplier = Supplier.query.get_or_404(id)

    data = request.get_json()

    supplier.supplier_name = data.get(
        "supplier_name",
        supplier.supplier_name
    )

    supplier.mobile = data.get(
        "mobile",
        supplier.mobile
    )

    supplier.email = data.get(
        "email",
        supplier.email
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Supplier Updated"
    })
@supplier_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_supplier(id):

    supplier = Supplier.query.get_or_404(id)

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Supplier Deleted"
    })
