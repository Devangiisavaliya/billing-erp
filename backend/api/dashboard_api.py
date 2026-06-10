from flask import Blueprint
from flask import jsonify
from database import db
from flask_jwt_extended import jwt_required

from sqlalchemy import func
from datetime import date

from models.customer import Customer
from models.product import Product
from models.supplier import Supplier
from models.purchase import Purchase
from models.sale import Sale

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def dashboard():

    try:

        today = date.today()

        # =====================
        # COUNTS
        # =====================

        total_customers = Customer.query.count()

        total_products = Product.query.count()

        total_suppliers = Supplier.query.count()

        total_purchases = Purchase.query.count()

        # =====================
        # TODAY SALES
        # =====================

        today_sales = db.session.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        ).filter(
            func.date(Sale.sale_date) == today
        ).scalar()

        # =====================
        # TODAY BILLS
        # =====================

        today_bills = Sale.query.filter(
            func.date(Sale.sale_date) == today
        ).count()

        # =====================
        # LOW STOCK
        # =====================

        low_stock_products = Product.query.filter(
            Product.stock_qty <= Product.low_stock_limit
        ).count()

        # =====================
        # MONTHLY REVENUE
        # =====================

        current_month = today.month
        current_year = today.year

        monthly_revenue = db.session.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        ).filter(
            func.month(Sale.sale_date)
            == current_month,

            func.year(Sale.sale_date)
            == current_year
        ).scalar()

        return jsonify({

            "success": True,

            "today_sales":
            float(today_sales),

            "today_bills":
            today_bills,

            "total_customers":
            total_customers,

            "total_products":
            total_products,

            "total_suppliers":
            total_suppliers,

            "total_purchases":
            total_purchases,

            "low_stock_products":
            low_stock_products,

            "monthly_revenue":
            float(monthly_revenue)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500