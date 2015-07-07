from django.contrib import admin
from mucua.models import Mucua, Rota

#class MucuaAdmin(admin.ModelAdmin):
#    readonly_fields=('uuid',)

admin.site.register(Mucua)
admin.site.register(Rota)
