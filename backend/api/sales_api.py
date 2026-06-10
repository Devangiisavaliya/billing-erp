from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.company_setting import CompanySettings
from database import db
from flask import send_file
from reportlab.pdfgen import canvas
import os
from models.sale import Sale
from models.sale_item import SaleItem
from models.product import Product
from models.customer import Customer

sales_bp = Blueprint(
    "sales",
    __name__,
    url_prefix="/api/sales"
)


# =====================================
# CREATE SALE / BILL
# =====================================

@sales_bp.route("", methods=["POST"])
@jwt_required()
def create_sale():

    try:

        data = request.get_json()

        customer_id = data.get("customer_id")
        payment_mode = data.get("payment_mode")
        payment_status = data.get(
            "payment_status",
            "paid"
        )

        items = data.get("items", [])

        if not items:
            return jsonify({
                "success": False,
                "message": "No products selected"
            }), 400

        customer = Customer.query.get(customer_id)

        if not customer:
            return jsonify({
                "success": False,
                "message": "Customer not found"
            }), 404

                # =========================
        # AUTO INVOICE NUMBER
        # =========================

        settings = CompanySettings.query.first()

        prefix = "INV"

        if settings and settings.invoice_prefix:
            prefix = settings.invoice_prefix

        last_sale = Sale.query.order_by(
            Sale.id.desc()
        ).first()

        next_no = 1

        if last_sale:
            next_no = last_sale.id + 1

        invoice_no = f"{prefix}-{next_no:04d}"

        subtotal = 0
        gst_amount = 0
        discount_amount = 0

        sale_items_data = []

        # =========================
        # PRODUCT LOOP
        # =========================

        for item in items:

            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 0))

            product = Product.query.get(product_id)

            if not product:
                return jsonify({
                    "success": False,
                    "message": f"Product {product_id} not found"
                }), 404

            if product.stock_qty < quantity:
                return jsonify({
                    "success": False,
                    "message":
                    f"Insufficient stock for {product.product_name}"
                }), 400

            price = product.selling_price

            line_total = price * quantity

            item_gst = (
                line_total *
                product.gst_percent
            ) / 100

            subtotal += line_total

            gst_amount += item_gst

            sale_items_data.append({
                "product_id": product.id,
                "quantity": quantity,
                "price": price,
                "gst_percent": product.gst_percent,
                "discount_percent": 0,
                "total": line_total + item_gst
            })

        total_amount = (
            subtotal +
            gst_amount -
            discount_amount
        )

        # =========================
        # SAVE SALE
        # =========================

        sale = Sale(
            invoice_no=invoice_no,
            customer_id=customer_id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            gst_amount=gst_amount,
            total_amount=total_amount,
            payment_mode=payment_mode,
            payment_status=payment_status,
            created_by=get_jwt_identity()
        )

        db.session.add(sale)
        db.session.flush()

        # =========================
        # SAVE SALE ITEMS
        # =========================

        for item in sale_items_data:

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                gst_percent=item["gst_percent"],
                discount_percent=item["discount_percent"],
                total=item["total"]
            )

            db.session.add(sale_item)

            # STOCK DEDUCTION

            product = Product.query.get(
                item["product_id"]
            )

            product.stock_qty -= item["quantity"]
        if payment_status != "paid":

            customer.outstanding_balance = (
                customer.outstanding_balance or 0
            ) + total_amount

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Bill Created Successfully",
            "invoice_no": invoice_no,
            "sale_id": sale.id,
            "subtotal": subtotal,
            "gst_amount": gst_amount,
            "total_amount": total_amount
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =====================================
# GET ALL SALES
# =====================================

@sales_bp.route("", methods=["GET"])
@jwt_required()
def get_sales():

    sales = Sale.query.order_by(
        Sale.id.desc()
    ).all()

    return jsonify([
        sale.to_dict()
        for sale in sales
    ])


# =====================================
# GET SINGLE SALE
# =====================================
@sales_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_sale(id):

    sale = Sale.query.get_or_404(id)

    sale_items = SaleItem.query.filter_by(
        sale_id=id
    ).all()

    items_data = []

    for item in sale_items:

        product = Product.query.get(
            item.product_id
        )

        items_data.append({
            "product_id": item.product_id,
            "product_name": product.product_name if product else "Unknown Product",
            "quantity": item.quantity,
            "price": item.price,
            "total": item.total
        })

    customer = Customer.query.get(
        sale.customer_id
    )

    return jsonify({
        "sale": sale.to_dict(),

        "customer": {
            "name": customer.customer_name if customer else "",
            "mobile": customer.mobile if customer else "",
            "address": customer.address if customer else ""
        },

        "items": items_data
    })

# =====================================
# DELETE SALE
# =====================================

@sales_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_sale(id):

    sale = Sale.query.get_or_404(id)

    items = SaleItem.query.filter_by(
        sale_id=id
    ).all()

    # RESTORE STOCK

    for item in items:

        product = Product.query.get(
            item.product_id
        )

        if product:
            product.stock_qty += item.quantity

    db.session.delete(sale)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Sale Deleted Successfully"
    })
@sales_bp.route(
    "/pdf/<int:id>",
    methods=["GET"]
)
def download_invoice(id):

    sale = Sale.query.get_or_404(id)

    items = SaleItem.query.filter_by(
        sale_id=id
    ).all()

    pdf_file = (
        f"invoice_{sale.invoice_no}.pdf"
    )

    c = canvas.Canvas(pdf_file)

    c.setFont(
        "Helvetica-Bold",
        16
    )

    c.drawString(
        200,
        800,
        "TAX INVOICE"
    )

    c.setFont(
        "Helvetica",
        12
    )

    c.drawString(
        50,
        760,
        f"Invoice : {sale.invoice_no}"
    )

    c.drawString(
        50,
        740,
        f"Customer ID : {sale.customer_id}"
    )

    y = 700

    for item in items:

        product = Product.query.get(
            item.product_id
        )

        c.drawString(
            50,
            y,
            product.product_name
        )

        c.drawString(
            250,
            y,
            str(item.quantity)
        )

        c.drawString(
            350,
            y,
            f"₹{item.total}"
        )

        y -= 20

    c.drawString(
        50,
        y - 30,
        f"GST : ₹{sale.gst_amount}"
    )

    c.drawString(
        50,
        y - 50,
        f"Grand Total : ₹{sale.total_amount}"
    )

    c.save()

    return send_file(
        pdf_file,
        as_attachment=True
    )