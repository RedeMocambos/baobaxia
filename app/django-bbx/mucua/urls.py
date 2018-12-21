from django.urls import re_path
from rest_framework.urlpatterns import format_suffix_patterns

from mucua import views as mucua_views


urlpatterns = [
    re_path(r'^mucua/list', mucua_views.mucua_list),
    re_path(r'^mucua/(?P<uuid>[a-zA-Z0-9\-]+)/info', mucua_views.mucua_get_info),
    re_path(r'^mucua/groups/(?P<uuid>[a-zA-Z0-9\-]+)', mucua_views.mucua_get_groups),
    re_path(r'^mucua/groups/', mucua_views.mucua_get_groups),
    re_path(r'^mucua/groupadd/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<group>[a-zA-Z0-9\-\_]+)', mucua_views.mucua_add_group),
    re_path(r'^mucua/groupdel/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<group>[a-zA-Z0-9\-\_]+)', mucua_views.mucua_del_group),
    re_path(r'^mucua/by_name/(?P<name>[a-zA-Z0-9\-]+)', mucua_views.mucua_get_by_name),
    re_path(r'^mucua/territoryset/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<territory>[a-zA-Z0-9\-\_\:]+)', mucua_views.mucua_set_territory),
    re_path(r'^mucua/territorydel/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<territory>[a-zA-Z0-9\-\_\:]+)', mucua_views.mucua_del_territory),
    re_path(r'^mucua/territory/(?P<uuid>[a-zA-Z0-9\-]+)', mucua_views.mucua_get_territory),
    re_path(r'^mucua/', mucua_views.mucua_get_default),
    re_path(r'^(?P<repository>\w+)/mucuas', mucua_views.mucua_list),
]

urlpatterns = format_suffix_patterns(urlpatterns)
