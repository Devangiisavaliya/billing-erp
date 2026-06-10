from database import db


class Supplier(db.Model):
    __tablename__ = "suppliers"

    id = db.Column(db.Integer, primary_key=True)

    supplier_name = db.Column(
        db.String(100),
        nullable=False
    )

    contact_person = db.Column(
        db.String(100)
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

    pending_payment = db.Column(
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
            "supplier_name": self.supplier_name,
            "contact_person": self.contact_person,
            "mobile": self.mobile,
            "email": self.email,
            "address": self.address,
            "gst_number": self.gst_number,
            "pending_payment": self.pending_payment
        }