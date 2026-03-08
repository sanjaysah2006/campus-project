import pdfplumber

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def filter_exam_holiday_blocks(text):
    blocks = []

    lines = text.split("\n")

    for line in lines:
        if "Exam" in line or "EXAM" in line:
            blocks.append({
                "type": "EXAM",
                "text": line
            })

        elif "Holiday" in line or "Preparatory" in line:
            blocks.append({
                "type": "HOLIDAY",
                "text": line
            })

    return blocks


import re
from datetime import datetime

MONTHS = {
    "JANUARY": "01", "FEBRUARY": "02", "MARCH": "03",
    "APRIL": "04", "MAY": "05", "JUNE": "06",
    "JULY": "07", "AUGUST": "08", "SEPTEMBER": "09",
    "OCTOBER": "10", "NOVEMBER": "11", "DECEMBER": "12"
}

def parse_exam_dates(text_line):
    """
    Handles:
    1) AUGUST 28-30, 2025
    2) NOVEMBER 17 - DECEMBER 06, 2025
    """

    # CASE 1: Same month range
    same_month = re.search(
        r'([A-Z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})',
        text_line
    )

    if same_month:
        month, start_day, end_day, year = same_month.groups()
        month_num = MONTHS.get(month)
        if not month_num:
            return None

        start_date = datetime.strptime(
            f"{year}-{month_num}-{start_day}",
            "%Y-%m-%d"
        ).date()

        end_date = datetime.strptime(
            f"{year}-{month_num}-{end_day}",
            "%Y-%m-%d"
        ).date()

        return start_date, end_date

    # CASE 2: Cross month range
    cross_month = re.search(
        r'([A-Z]+)\s+(\d{1,2})\s*-\s*([A-Z]+)\s+(\d{1,2}),\s*(\d{4})',
        text_line
    )

    if cross_month:
        start_month, start_day, end_month, end_day, year = cross_month.groups()

        start_month_num = MONTHS.get(start_month)
        end_month_num = MONTHS.get(end_month)

        if not start_month_num or not end_month_num:
            return None

        start_date = datetime.strptime(
            f"{year}-{start_month_num}-{start_day}",
            "%Y-%m-%d"
        ).date()

        end_date = datetime.strptime(
            f"{year}-{end_month_num}-{end_day}",
            "%Y-%m-%d"
        ).date()

        return start_date, end_date

    return None
