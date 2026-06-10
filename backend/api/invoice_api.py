from flask import Blueprint
from flask import jsonify
from flask import send_file
from models.company_setting import CompanySettings
from flask_jwt_extended import jwt_required

from models.sale import Sale
from models.sale_item import SaleItem
from models.customer import Customer
from models.product import Product

from services.pdf_service import (
    generate_invoice_pdf
)

invoice_bp = Blueprint(
    "invoice",
    __name__,
    url_prefix="/api/invoice"
)


@invoice_bp.route("/<int:sale_id>", methods=["GET"])
@jwt_required()
def download_invoice(sale_id):

    try:

        # ==========================
        # SALE
        # ==========================

        sale = Sale.query.get_or_404(
            sale_id
        )

        # ==========================
        # CUSTOMER
        # ==========================

        customer = Customer.query.get(
            sale.customer_id
        )

        # ==========================
        # SALE ITEMS
        # ==========================

        sale_items_db = SaleItem.query.filter_by(
            sale_id=sale.id
        ).all()

        sale_items = []

        for item in sale_items_db:

            product = Product.query.get(
                item.product_id
            )

            sale_items.append({
                "product_name":
                product.product_name
                if product
                else "Unknown Product",

                "quantity":
                item.quantity,

                "price":
                item.price,

                "gst_percent":
                item.gst_percent,

                "total":
                item.total
            })

        # ==========================
        # COMPANY DETAILS
        # ==========================

    
        settings = CompanySettings.query.first()

        company = {
            "name": settings.company_name,
            "gstin": settings.gst_number,
            "address": settings.address
        }

        # ==========================
        # GENERATE PDF
        # ==========================

        pdf_path = generate_invoice_pdf(
            sale,
            customer,
            sale_items,
            company
        )

        # ==========================
        # RETURN PDF
        # ==========================

        return send_file(
            pdf_path,
            as_attachment=True
        )

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500