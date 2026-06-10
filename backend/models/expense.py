from database import db


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    expense_name = db.Column(
        db.String(150),
        nullable=False
    )

    expense_category = db.Column(
        db.String(100),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    expense_date = db.Column(
        db.Date,
        nullable=False
    )

    notes = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    def to_dict(self):

        return {
            "id": self.id,
            "expense_name": self.expense_name,
            "expense_category": self.expense_category,
            "amount": self.amount,
            "expense_date": str(self.expense_date),
            "notes": self.notes
        }