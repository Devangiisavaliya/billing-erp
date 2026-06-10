from database import db


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    purchase_no = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    supplier_id = db.Column(
        db.Integer,
        db.ForeignKey("suppliers.id"),
        nullable=False
    )

    purchase_date = db.Column(
        db.Date,
        nullable=False
    )

    subtotal = db.Column(
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

    payment_status = db.Column(
        db.Enum(
            "paid",
            "pending"
        ),
        default="pending"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    items = db.relationship(
        "PurchaseItem",
        backref="purchase",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "purchase_no": self.purchase_no,
            "supplier_id": self.supplier_id,
            "purchase_date": str(self.purchase_date),
            "subtotal": self.subtotal,
            "gst_amount": self.gst_amount,
            "total_amount": self.total_amount,
            "payment_status": self.payment_status
        }