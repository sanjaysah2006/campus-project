from django.contrib import admin
from .models import AcademicCalendar, AcademicCalendarUpload
from .utils import (
    extract_text_from_pdf,
    filter_exam_holiday_blocks,
    parse_exam_dates
)


@admin.register(AcademicCalendarUpload)
class AcademicCalendarUploadAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_at')
    readonly_fields = ('uploaded_at',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        pdf_path = obj.pdf.path
        text = extract_text_from_pdf(pdf_path)
        blocks = filter_exam_holiday_blocks(text)

        print("=== SAVING EXAM DATES TO DATABASE ===")

        for block in blocks:
            if block['type'] != 'EXAM':
                continue

            parsed = parse_exam_dates(block['text'])
            if not parsed:
                continue

            start_date, end_date = parsed
            title = block['text']

            # Prevent duplicates
            exists = AcademicCalendar.objects.filter(
                type='EXAM',
                start_date=start_date,
                end_date=end_date
            ).exists()

            if not exists:
                AcademicCalendar.objects.create(
                    title=title,
                    type='EXAM',
                    start_date=start_date,
                    end_date=end_date
                )
                print("✔ Saved:", title)
            else:
                print("⏭ Skipped duplicate:", title)


# Register AcademicCalendar normally
admin.site.register(AcademicCalendar)
