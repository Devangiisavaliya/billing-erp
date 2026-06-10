from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from sqlalchemy import func

from database import db

from models.sale import Sale
from models.sale_item import SaleItem
from models.product import Product
from models.customer import Customer
from models.expense import Expense


analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics"
)


@analytics_bp.route("", methods=["GET"])
@jwt_required()
def analytics():

    try:

        # ==========================
        # TOTAL REVENUE
        # ==========================

        total_revenue = db.session.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        ).scalar()

        # ==========================
        # TOTAL EXPENSES
        # ==========================

        total_expenses = db.session.query(
            func.coalesce(
                func.sum(Expense.amount),
                0
            )
        ).scalar()

        # ==========================
        # NET PROFIT
        # ==========================

        net_profit = (
            float(total_revenue)
            -
            float(total_expenses)
        )

        # ==========================
        # BEST SELLING PRODUCT
        # ==========================

        best_product = db.session.query(
            Product.product_name,
            func.sum(
                SaleItem.quantity
            ).label("qty")
        ).join(
            SaleItem,
            Product.id == SaleItem.product_id
        ).group_by(
            Product.product_name
        ).order_by(
            func.sum(
                SaleItem.quantity
            ).desc()
        ).first()

        # ==========================
        # TOP CUSTOMER
        # ==========================

        top_customer = db.session.query(
            Customer.customer_name,
            func.sum(
                Sale.total_amount
            ).label("amount")
        ).join(
            Sale,
            Customer.id == Sale.customer_id
        ).group_by(
            Customer.customer_name
        ).order_by(
            func.sum(
                Sale.total_amount
            ).desc()
        ).first()

        # ==========================
        # COUNTS
        # ==========================

        total_customers = Customer.query.count()

        total_products = Product.query.count()

        total_sales = Sale.query.count()

        # ==========================
        # RESPONSE
        # ==========================

        return jsonify({

            "success": True,

            "total_revenue":
            float(total_revenue),

            "total_expenses":
            float(total_expenses),

            "net_profit":
            float(net_profit),

            "best_selling_product":
            best_product[0]
            if best_product
            else None,

            "best_selling_qty":
            int(best_product[1])
            if best_product
            else 0,

            "top_customer":
            top_customer[0]
            if top_customer
            else None,

            "top_customer_amount":
            float(top_customer[1])
            if top_customer
            else 0,

            "total_customers":
            total_customers,

            "total_products":
            total_products,

            "total_sales":
            total_sales
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500