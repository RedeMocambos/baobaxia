from django.contrib import admin
from media.models import Media

class MediaAdmin(admin.ModelAdmin):
    list_display = ('name','origin','date','author','format')
    search_fields = ('name',)
    list_filter = ('date', 'origin', 'author', 'format', 'is_local', 'is_requested')

admin.site.register(Media, MediaAdmin)
