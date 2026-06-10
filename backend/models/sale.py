from database import db
from flask import send_file
from reportlab.pdfgen import canvas
import os

class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    invoice_no = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id")
    )

    sale_date = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    subtotal = db.Column(
        db.Float,
        default=0
    )

    discount_amount = db.Column(
        db.Float,
        default=0
    )

    gst_amount = db.Column(
        db.Float,
        default=0
    )

    total_amount = db.Column(
        db.Float,
        default=0
    )

    payment_mode = db.Column(
        db.Enum(
            "cash",
            "upi",
            "card",
            "bank"
        )
    )

    payment_status = db.Column(
        db.Enum(
            "paid",
            "partial",
            "pending"
        ),
        default="paid"
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )

    items = db.relationship(
        "SaleItem",
        backref="sale",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_no": self.invoice_no,
            "customer_id": self.customer_id,
            "subtotal": self.subtotal,
            "discount_amount": self.discount_amount,
            "gst_amount": self.gst_amount,
            "total_amount": self.total_amount,
            "payment_mode": self.payment_mode,
            "payment_status": self.payment_status,
            "sale_date": self.sale_date.strftime("%d-%m-%Y %H:%M")
        if self.sale_date else ""
        }