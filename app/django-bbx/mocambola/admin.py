from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from mocambola.models import Mocambola


class UserInline(admin.TabularInline):
    model = Mocambola
    extra = 1


class MyUserAdmin(UserAdmin):
    inlines = [UserInline]
    can_delete = False

admin.site.unregister(User)
admin.site.register(User, MyUserAdmin)
#admin.site.register(Mocambola)
