import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet

import qrcode


def generate_invoice_pdf(
    sale,
    customer,
    sale_items,
    company
):

    pdf_dir = "exports/pdf"

    os.makedirs(pdf_dir, exist_ok=True)

    pdf_path = os.path.join(
        pdf_dir,
        f"{sale.invoice_no}.pdf"
    )

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    elements = []

    # ==========================
    # COMPANY DETAILS
    # ==========================

    elements.append(
        Paragraph(
            f"<b>{company['name']}</b>",
            styles["Title"]
        )
    )

    elements.append(
        Paragraph(
            f"GSTIN : {company['gstin']}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            company["address"],
            styles["Normal"]
        )
    )

    elements.append(
        Spacer(1, 20)
    )

    # ==========================
    # INVOICE DETAILS
    # ==========================

    elements.append(
        Paragraph(
            f"<b>Invoice No :</b> {sale.invoice_no}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Date :</b> {sale.sale_date}",
            styles["Normal"]
        )
    )

    elements.append(
        Spacer(1, 10)
    )

    # ==========================
    # CUSTOMER DETAILS
    # ==========================

    elements.append(
        Paragraph(
            f"<b>Customer :</b> {customer.customer_name}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Mobile :</b> {customer.mobile}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Address :</b> {customer.address}",
            styles["Normal"]
        )
    )

    elements.append(
        Spacer(1, 15)
    )

    # ==========================
    # PRODUCT TABLE
    # ==========================

    table_data = [[
        "Product",
        "Qty",
        "Rate",
        "GST %",
        "Total"
    ]]

    for item in sale_items:

        table_data.append([
            item["product_name"],
            item["quantity"],
            f"{item['price']:.2f}",
            f"{item['gst_percent']}%",
            f"{item['total']:.2f}"
        ])

    table = Table(
        table_data,
        colWidths=[180, 60, 80, 60, 100]
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")
        ])
    )

    elements.append(table)

    elements.append(
        Spacer(1, 20)
    )

    # ==========================
    # TOTALS
    # ==========================

    elements.append(
        Paragraph(
            f"<b>Subtotal :</b> ₹ {sale.subtotal:.2f}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>GST :</b> ₹ {sale.gst_amount:.2f}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Discount :</b> ₹ {sale.discount_amount:.2f}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Grand Total :</b> ₹ {sale.total_amount:.2f}",
            styles["Heading2"]
        )
    )

    elements.append(
        Spacer(1, 20)
    )

    # ==========================
    # QR CODE
    # ==========================

    qr_data = (
        f"Invoice:{sale.invoice_no}\n"
        f"Amount:{sale.total_amount}"
    )

    qr = qrcode.make(qr_data)

    qr_path = os.path.join(
        pdf_dir,
        f"{sale.invoice_no}_qr.png"
    )

    qr.save(qr_path)

    from reportlab.platypus import Image

    qr_img = Image(
        qr_path,
        width=100,
        height=100
    )

    elements.append(qr_img)

    elements.append(
        Spacer(1, 20)
    )

    elements.append(
        Paragraph(
            "Thank You For Your Business",
            styles["Heading3"]
        )
    )

    # ==========================
    # BUILD PDF
    # ==========================

    doc.build(elements)

    return pdf_path