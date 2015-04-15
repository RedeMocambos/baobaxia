from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns('mucua.views',
                       url(r'^mucua/list', 'mucua_list'),
                       url(r'^mucua/(?P<uuid>[a-zA-Z0-9\-]+)/info', 'mucua_get_info'),
                       url(r'^mucua/groups/(?P<uuid>[a-zA-Z0-9\-]+)', 'mucua_get_groups'),
                       url(r'^mucua/groups/', 'mucua_get_groups'),
                       url(r'^mucua/groupadd/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<group>[a-zA-Z0-9\-\_]+)', 'mucua_add_group'),
                       url(r'^mucua/groupdel/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<group>[a-zA-Z0-9\-\_]+)', 'mucua_del_group'),
                       url(r'^mucua/by_name/(?P<name>[a-zA-Z0-9\-]+)', 'mucua_get_by_name'),
                       url(r'^mucua/territoryset/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<territory>[a-zA-Z0-9\-\_\:]+)', 'mucua_set_territory'),
                       url(r'^mucua/territorydel/(?P<uuid>[a-zA-Z0-9\-]+)/(?P<territory>[a-zA-Z0-9\-\_\:]+)', 'mucua_del_territory'),
                       url(r'^mucua/territory/(?P<uuid>[a-zA-Z0-9\-]+)', 'mucua_get_territory'),
                       url(r'^mucua/', 'mucua_get_default'),
                       url(r'^(?P<repository>\w+)/mucuas', 'mucua_list'),)

urlpatterns = format_suffix_patterns(urlpatterns)
