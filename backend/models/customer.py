from database import db


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)

    customer_name = db.Column(
        db.String(100),
        nullable=False
    )

    mobile = db.Column(
        db.String(15)
    )

    email = db.Column(
        db.String(100)
    )

    address = db.Column(
        db.Text
    )

    gst_number = db.Column(
        db.String(20)
    )

    outstanding_balance = db.Column(
        db.Float,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "customer_name": self.customer_name,
            "mobile": self.mobile,
            "email": self.email,
            "address": self.address,
            "gst_number": self.gst_number,
            "outstanding_balance": self.outstanding_balance
        }