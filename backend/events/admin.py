from django.contrib import admin
from .models import Event, EventInteraction

admin.site.register(Event)
admin.site.register(EventInteraction)
