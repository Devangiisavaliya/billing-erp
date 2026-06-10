from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from sqlalchemy import func

from database import db

from models.payment import Payment
from models.sale import Sale
from models.customer import Customer

payment_bp = Blueprint(
    "payment",
    __name__,
    url_prefix="/api/payments"
)


# ====================================
# ADD PAYMENT
# ====================================

@payment_bp.route("", methods=["POST"])
@jwt_required()
def add_payment():

    try:

        data = request.get_json()

        sale = Sale.query.get(
            data["sale_id"]
        )

        if not sale:

            return jsonify({
                "success": False,
                "message": "Sale not found"
            }), 404

        customer = Customer.query.get(
            data["customer_id"]
        )

        if not customer:

            return jsonify({
                "success": False,
                "message": "Customer not found"
            }), 404

        payment = Payment(
            sale_id=data["sale_id"],
            customer_id=data["customer_id"],
            amount=data["amount"],
            payment_mode=data.get(
                "payment_mode"
            ),
            transaction_id=data.get(
                "transaction_id"
            )
        )

        db.session.add(payment)

        db.session.flush()

        total_paid = db.session.query(
            func.coalesce(
                func.sum(Payment.amount),
                0
            )
        ).filter(
            Payment.sale_id == sale.id
        ).scalar()

        if float(total_paid) >= float(sale.total_amount):
            sale.payment_status = "paid"
        else:
            sale.payment_status = "partial"

        db.session.commit()

        return jsonify({
            "success": True,
            "message":
            "Payment Added Successfully",
            "payment_id":
            payment.id
        })

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ====================================
# GET ALL PAYMENTS
# ====================================

@payment_bp.route("", methods=["GET"])
@jwt_required()
def get_payments():

    payments = Payment.query.order_by(
        Payment.id.desc()
    ).all()

    result = []

    for payment in payments:

        result.append({
            "id": payment.id,
            "sale_id": payment.sale_id,
            "customer_id": payment.customer_id,
            "amount": payment.amount,
            "payment_mode": payment.payment_mode,
            "transaction_id": payment.transaction_id,
            "payment_date": str(payment.payment_date)
        })

    return jsonify(result)


# ====================================
# GET SINGLE PAYMENT
# ====================================

@payment_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_payment(id):

    payment = Payment.query.get(id)

    if not payment:

        return jsonify({
            "success": False,
            "message": "Payment not found"
        }), 404

    return jsonify({
        "id": payment.id,
        "sale_id": payment.sale_id,
        "customer_id": payment.customer_id,
        "amount": payment.amount,
        "payment_mode": payment.payment_mode,
        "transaction_id": payment.transaction_id,
        "payment_date": str(payment.payment_date)
    })


# ====================================
# CUSTOMER PAYMENT HISTORY
# ====================================

@payment_bp.route(
    "/customer/<int:customer_id>",
    methods=["GET"]
)
@jwt_required()
def customer_payments(customer_id):

    payments = Payment.query.filter_by(
        customer_id=customer_id
    ).all()

    result = []

    for payment in payments:

        result.append({
            "id": payment.id,
            "sale_id": payment.sale_id,
            "amount": payment.amount,
            "payment_mode": payment.payment_mode,
            "transaction_id": payment.transaction_id,
            "payment_date": str(payment.payment_date)
        })

    return jsonify(result)


# ====================================
# SALE PAYMENT HISTORY
# ====================================

@payment_bp.route(
    "/sale/<int:sale_id>",
    methods=["GET"]
)
@jwt_required()
def sale_payments(sale_id):

    payments = Payment.query.filter_by(
        sale_id=sale_id
    ).all()

    result = []

    for payment in payments:

        result.append({
            "id": payment.id,
            "amount": payment.amount,
            "payment_mode": payment.payment_mode,
            "transaction_id": payment.transaction_id,
            "payment_date": str(payment.payment_date)
        })

    return jsonify(result)


# ====================================
# OUTSTANDING BALANCE
# ====================================

@payment_bp.route(
    "/outstanding/<int:customer_id>",
    methods=["GET"]
)
@jwt_required()
def outstanding_balance(customer_id):

    customer = Customer.query.get(
        customer_id
    )

    if not customer:

        return jsonify({
            "success": False,
            "message":
            "Customer not found"
        }), 404

    total_sales = db.session.query(
        func.coalesce(
            func.sum(
                Sale.total_amount
            ),
            0
        )
    ).filter(
        Sale.customer_id == customer_id
    ).scalar()

    total_paid = db.session.query(
        func.coalesce(
            func.sum(
                Payment.amount
            ),
            0
        )
    ).filter(
        Payment.customer_id == customer_id
    ).scalar()

    outstanding = (
        float(total_sales)
        -
        float(total_paid)
    )

    return jsonify({

        "success": True,

        "customer_id":
        customer.id,

        "customer_name":
        customer.customer_name,

        "total_sales":
        float(total_sales),

        "total_paid":
        float(total_paid),

        "outstanding":
        float(outstanding)
    })


# ====================================
# DELETE PAYMENT
# ====================================

@payment_bp.route(
    "/<int:id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_payment(id):

    payment = Payment.query.get(id)

    if not payment:

        return jsonify({
            "success": False,
            "message":
            "Payment not found"
        }), 404

    db.session.delete(payment)

    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "Payment Deleted Successfully"
    })