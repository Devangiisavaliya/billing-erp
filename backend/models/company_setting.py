from database import db


class CompanySettings(db.Model):
    __tablename__ = "company_settings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    company_name = db.Column(
        db.String(255)
    )

    address = db.Column(
        db.Text
    )

    mobile = db.Column(
        db.String(20)
    )

    email = db.Column(
        db.String(100)
    )

    gst_number = db.Column(
        db.String(30)
    )

    logo = db.Column(
        db.String(255)
    )

    invoice_prefix = db.Column(
        db.String(20)
    )

    created_at = db.Column(
        db.DateTime
    )

    def to_dict(self):

        return {
            "id": self.id,
            "company_name": self.company_name,
            "address": self.address,
            "mobile": self.mobile,
            "email": self.email,
            "gst_number": self.gst_number,
            "logo": self.logo,
            "invoice_prefix": self.invoice_prefix
        }