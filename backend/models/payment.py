from database import db


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id"),
        nullable=False
    )

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    payment_mode = db.Column(
        db.String(50)
    )

    transaction_id = db.Column(
        db.String(100)
    )

    payment_date = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )