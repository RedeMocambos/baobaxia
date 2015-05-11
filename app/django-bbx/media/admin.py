from django.contrib import admin
from media.models import Media

def set_as_not_requested(modeladmin, request, queryset):
    queryset.update(is_requested=False)
set_as_not_requested.short_description = "Set media as not requested"


class MediaAdmin(admin.ModelAdmin):
    list_display = ('name','origin','date','author','format')
    search_fields = ('name',)
    list_filter = ('date', 'origin', 'author', 'format', 'is_local', 'is_requested')
    actions = [set_as_not_requested]

admin.site.register(Media, MediaAdmin)
