from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required

from datetime import datetime
from sqlalchemy import func

from database import db
from models.expense import Expense

expense_bp = Blueprint(
    "expense",
    __name__,
    url_prefix="/api/expenses"
)
@expense_bp.route("", methods=["POST"])
@jwt_required()
def add_expense():

    data = request.get_json()

    expense = Expense(
        expense_name=data.get(
            "expense_name"
        ),
        expense_category=data.get(
            "expense_category"
        ),
        amount=data.get(
            "amount"
        ),
        expense_date=datetime.strptime(
            data.get("expense_date"),
            "%Y-%m-%d"
        ).date(),
        notes=data.get(
            "notes"
        )
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "Expense Added Successfully"
    })
@expense_bp.route("", methods=["GET"])
@jwt_required()
def get_expenses():

    expenses = Expense.query.order_by(
        Expense.id.desc()
    ).all()

    return jsonify([
        expense.to_dict()
        for expense in expenses
    ])
@expense_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_expense(id):

    expense = Expense.query.get_or_404(id)

    return jsonify(
        expense.to_dict()
    )
@expense_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_expense(id):

    expense = Expense.query.get_or_404(id)

    data = request.get_json()

    expense.expense_name = data.get(
        "expense_name",
        expense.expense_name
    )

    expense.amount = data.get(
        "amount",
        expense.amount
    )

    expense.description = data.get(
        "description",
        expense.description
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "Expense Updated Successfully"
    })
@expense_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_expense(id):

    expense = Expense.query.get_or_404(id)

    db.session.delete(expense)

    db.session.commit()

    return jsonify({
        "success": True,
        "message":
        "Expense Deleted Successfully"
    })
@expense_bp.route("/monthly-report", methods=["GET"])
@jwt_required()
def monthly_expense_report():

    current_month = datetime.now().month
    current_year = datetime.now().year

    total_expense = db.session.query(
        func.coalesce(
            func.sum(
                Expense.amount
            ),
            0
        )
    ).filter(
        func.month(
            Expense.expense_date
        ) == current_month,

        func.year(
            Expense.expense_date
        ) == current_year
    ).scalar()

    return jsonify({
        "success": True,
        "month": current_month,
        "year": current_year,
        "total_expense":
        float(total_expense)
    })
