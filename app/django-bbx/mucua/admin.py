from django.contrib import admin
from mucua.models import Mucua, Rota

#class RotaAdmin(admin.ModelAdmin):
#    readonly_fields=('is_available',)

admin.site.register(Mucua)
admin.site.register(Rota)

