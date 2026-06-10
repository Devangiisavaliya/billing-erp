from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

from config import Config
from database import db

# Models
from models.sale import Sale
from models.sale_item import SaleItem
from models.purchase_item import PurchaseItem

# API Blueprints
from api.auth_api import auth_bp
from api.customer_api import customer_bp
from api.category_api import category_bp
from api.product_api import product_bp
from api.supplier_api import supplier_bp
from api.purchase_api import purchase_bp
from api.inventory_api import inventory_bp
from api.sales_api import sales_bp
from api.invoice_api import invoice_bp
from api.dashboard_api import dashboard_bp
from api.report_api import report_bp
from api.expense_api import expense_bp
from api.analytics_api import analytics_bp
from api.settings_api import settings_bp
from api.barcode_api import barcode_bp
from api.whatsapp_api import whatsapp_bp
from api.ocr_api import ocr_bp
from api.qr_api import qr_bp
from api.payment_api import payment_bp


def create_app():

    app = Flask(__name__)

    # Config
    app.config.from_object(Config)
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

    # Extensions
    CORS(app)
    db.init_app(app)
    JWTManager(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(purchase_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(invoice_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(barcode_bp)
    app.register_blueprint(whatsapp_bp)
    app.register_blueprint(ocr_bp)
    app.register_blueprint(qr_bp)
    app.register_blueprint(payment_bp)

    # Frontend Folder Path
    FRONTEND_FOLDER = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../frontend"
        )
    )

    # Login Page
    @app.route("/")
    def home():
        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    @app.route("/login")
    def login():
        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    @app.route("/dashboard.html")
    def dashboard():
        return send_from_directory(
            FRONTEND_FOLDER,
            "dashboard.html"
        )
    
    @app.route("/customers")
    def customers():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "customers.html"
        )
    @app.route("/categories")
    def categories():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "categories.html"
        )
    @app.route("/products")
    def products():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "products.html"
        )

    @app.route("/suppliers")
    def suppliers():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "suppliers.html"
        )

    @app.route("/purchases")
    def purchases():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "purchases.html"
        )

    @app.route("/inventory")
    def inventory():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "inventory.html"
        )
    @app.route("/reports")
    def reports():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "reports.html"
        )
    @app.route("/settings")
    def settings():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "settings.html"
        )   
    @app.route("/billing")
    def billing():
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            "billing.html"
        )   
        
    
    
    @app.route("/pages/<path:filename>")
    def pages(filename):
        return send_from_directory(
            os.path.join(
                FRONTEND_FOLDER,
                "pages"
            ),
            filename
        )
    # CSS Files
    @app.route("/css/<path:filename>")
    def css_files(filename):
        return send_from_directory(
            os.path.join(FRONTEND_FOLDER, "css"),
            filename
        )

    # JS Files
    @app.route("/js/<path:filename>")
    def js_files(filename):
        return send_from_directory(
            os.path.join(FRONTEND_FOLDER, "js"),
            filename
        )

    # Assets Files
    @app.route("/assets/<path:filename>")
    def asset_files(filename):
        return send_from_directory(
            os.path.join(FRONTEND_FOLDER, "assets"),
            filename
        )

    return app


app = create_app()

with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )