from database import db


class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False
    )

    price = db.Column(
        db.Float,
        nullable=False
    )

    gst_percent = db.Column(
        db.Float,
        default=0
    )

    discount_percent = db.Column(
        db.Float,
        default=0
    )

    total = db.Column(
        db.Float,
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "sale_id": self.sale_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": self.price,
            "gst_percent": self.gst_percent,
            "discount_percent": self.discount_percent,
            "total": self.total
        }