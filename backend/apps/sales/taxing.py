from decimal import Decimal, ROUND_HALF_UP

from apps.taxes.models import TaxConfiguration

MONEY = Decimal("0.01")


def money(value):
    return Decimal(value or 0).quantize(MONEY, rounding=ROUND_HALF_UP)


def percent_amount(base, rate):
    return money(Decimal(base or 0) * Decimal(rate or 0) / Decimal("100"))


def inclusive_tax_breakdown(gross, vat_rate, tot_rate):
    gross = money(gross)
    vat_rate = Decimal(vat_rate or 0)
    tot_rate = Decimal(tot_rate or 0)
    combined_rate = vat_rate + tot_rate
    if combined_rate <= 0:
        return {"net": gross, "vat": Decimal("0.00"), "tot": Decimal("0.00"), "tax": Decimal("0.00")}

    net = money(gross / (Decimal("1") + (combined_rate / Decimal("100"))))
    vat = percent_amount(net, vat_rate)
    tot = percent_amount(net, tot_rate)
    tax = money(vat + tot)
    return {"net": money(gross - tax), "vat": vat, "tot": tot, "tax": tax}


def turnover_tax_rate():
    tax = (
        TaxConfiguration.objects.filter(is_active=True, code__in=["tot", "tot-1-5", "turnover-tax"])
        .order_by("application_order", "name")
        .first()
    )
    return Decimal(tax.rate) if tax else Decimal("0")


def calculate_order_tax_lines(line_bases):
    tot_rate = turnover_tax_rate()
    breakdowns = [
        inclusive_tax_breakdown(item["base"], item["vat_rate"], tot_rate)
        for item in line_bases
    ]
    gross_total = money(sum((Decimal(item["base"]) for item in line_bases), Decimal("0")))
    subtotal = money(sum((item["net"] for item in breakdowns), Decimal("0")))
    vat_total = money(sum((item["vat"] for item in breakdowns), Decimal("0")))
    tot_total = money(sum((item["tot"] for item in breakdowns), Decimal("0")))
    tax_total = money(vat_total + tot_total)

    return {
        "subtotal": subtotal,
        "gross_total": gross_total,
        "vat_rate": Decimal("16.00"),
        "vat_total": vat_total,
        "tot_rate": tot_rate,
        "tot_total": tot_total,
        "tax_total": tax_total,
        "tax_lines": [
            {"code": "VAT", "name": "VAT", "rate": str(Decimal("16.00")), "amount": str(vat_total)},
            {"code": "TOT", "name": "TOT", "rate": str(tot_rate), "amount": str(tot_total)},
        ],
    }


def tax_lines_from_payload(payload):
    lines = payload.get("tax_lines") if isinstance(payload, dict) else None
    if not lines:
        return []
    return lines
