from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from database import db
from models.customer import Customer

customer_bp = Blueprint(
    "customer",
    __name__,
    url_prefix="/api/customers"
)
@customer_bp.route("", methods=["POST"])
@jwt_required()
def add_customer():

    data = request.get_json()

    customer = Customer(
        customer_name=data.get("customer_name"),
        mobile=data.get("mobile"),
        email=data.get("email"),
        address=data.get("address"),
        gst_number=data.get("gst_number")
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Customer Added Successfully"
    }), 201
    
@customer_bp.route("", methods=["GET"])
@jwt_required()
def get_customers():

    customers = Customer.query.all()

    return jsonify([
        customer.to_dict()
        for customer in customers
    ])
@customer_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_customer(id):

    customer = Customer.query.get_or_404(id)

    return jsonify(
        customer.to_dict()
    )
@customer_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_customer(id):

    customer = Customer.query.get_or_404(id)

    data = request.get_json()

    customer.customer_name = data.get(
        "customer_name",
        customer.customer_name
    )

    customer.mobile = data.get(
        "mobile",
        customer.mobile
    )

    customer.email = data.get(
        "email",
        customer.email
    )

    customer.address = data.get(
        "address",
        customer.address
    )

    customer.gst_number = data.get(
        "gst_number",
        customer.gst_number
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Customer Updated"
    })
@customer_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_customer(id):

    customer = Customer.query.get_or_404(id)

    db.session.delete(customer)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Customer Deleted"
    })