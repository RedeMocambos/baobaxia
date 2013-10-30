from django.contrib import admin
from mucua.models import Mucua


#class MucuaAdmin(admin.ModelAdmin):
#    readonly_fields=('uuid',)

admin.site.register(Mucua)
