from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from sqlalchemy import func
from datetime import date

from database import db

from models.sale import Sale
from models.sale_item import SaleItem
from models.product import Product
from models.customer import Customer

report_bp = Blueprint(
    "report",
    __name__,
    url_prefix="/api/reports"
)


# =====================================
# DAILY REPORT
# =====================================

@report_bp.route("/daily", methods=["GET"])
@jwt_required()
def daily_report():

    today = date.today()

    total_sales = db.session.query(
        func.coalesce(
            func.sum(Sale.total_amount),
            0
        )
    ).filter(
        func.date(Sale.sale_date) == today
    ).scalar()

    total_bills = Sale.query.filter(
        func.date(Sale.sale_date) == today
    ).count()

    return jsonify({
        "success": True,
        "date": str(today),
        "total_sales": float(total_sales),
        "total_bills": total_bills
    })


# =====================================
# MONTHLY REPORT
# =====================================

@report_bp.route("/monthly", methods=["GET"])
@jwt_required()
def monthly_report():

    today = date.today()

    total_sales = db.session.query(
        func.coalesce(
            func.sum(Sale.total_amount),
            0
        )
    ).filter(
        func.month(Sale.sale_date) == today.month,
        func.year(Sale.sale_date) == today.year
    ).scalar()

    total_bills = Sale.query.filter(
        func.month(Sale.sale_date) == today.month,
        func.year(Sale.sale_date) == today.year
    ).count()

    return jsonify({
        "success": True,
        "month": today.month,
        "year": today.year,
        "total_sales": float(total_sales),
        "total_bills": total_bills
    })


# =====================================
# YEARLY REPORT
# =====================================

@report_bp.route("/yearly", methods=["GET"])
@jwt_required()
def yearly_report():

    today = date.today()

    total_sales = db.session.query(
        func.coalesce(
            func.sum(Sale.total_amount),
            0
        )
    ).filter(
        func.year(Sale.sale_date) == today.year
    ).scalar()

    total_bills = Sale.query.filter(
        func.year(Sale.sale_date) == today.year
    ).count()

    return jsonify({
        "success": True,
        "year": today.year,
        "total_sales": float(total_sales),
        "total_bills": total_bills
    })


# =====================================
# GST REPORT
# =====================================

@report_bp.route("/gst", methods=["GET"])
@jwt_required()
def gst_report():

    total_gst = db.session.query(
        func.coalesce(
            func.sum(Sale.gst_amount),
            0
        )
    ).scalar()

    return jsonify({
        "success": True,
        "total_gst": float(total_gst)
    })


# =====================================
# CUSTOMER REPORT
# =====================================

@report_bp.route("/customer", methods=["GET"])
@jwt_required()
def customer_report():

    customers = Customer.query.all()

    result = []

    for customer in customers:

        total_purchase = db.session.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        ).filter(
            Sale.customer_id == customer.id
        ).scalar()

        result.append({
            "customer_id": customer.id,
            "customer_name": customer.customer_name,
            "mobile": customer.mobile,
            "total_purchase": float(total_purchase)
        })

    return jsonify(result)


# =====================================
# PRODUCT SALES REPORT
# =====================================

@report_bp.route("/product-sales", methods=["GET"])
@jwt_required()
def product_sales_report():

    data = db.session.query(
        Product.product_name,
        func.sum(SaleItem.quantity)
    ).join(
        SaleItem,
        Product.id == SaleItem.product_id
    ).group_by(
        Product.product_name
    ).all()

    result = []

    for row in data:

        result.append({
            "product_name": row[0],
            "quantity_sold": int(row[1])
        })

    return jsonify(result)