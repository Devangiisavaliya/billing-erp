from database import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    product_code = db.Column(
        db.String(50),
        unique=True
    )

    barcode = db.Column(
        db.String(100),
        unique=True
    )

    product_name = db.Column(
        db.String(150),
        nullable=False
    )

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id")
    )

    hsn_code = db.Column(
        db.String(20)
    )

    purchase_price = db.Column(
        db.Float,
        default=0
    )

    selling_price = db.Column(
        db.Float,
        default=0
    )

    gst_percent = db.Column(
        db.Float,
        default=0
    )

    stock_qty = db.Column(
        db.Integer,
        default=0
    )

    low_stock_limit = db.Column(
        db.Integer,
        default=5
    )

    image = db.Column(
        db.String(255)
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "product_code": self.product_code,
            "barcode": self.barcode,
            "product_name": self.product_name,
            "category_id": self.category_id,
            "hsn_code": self.hsn_code,
            "purchase_price": self.purchase_price,
            "selling_price": self.selling_price,
            "gst_percent": self.gst_percent,
            "stock_qty": self.stock_qty,
            "low_stock_limit": self.low_stock_limit,
            "image": self.image
        }