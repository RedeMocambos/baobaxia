from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns('mucua.views',
    url(r'^mucua/list', 'mucua_list'),
    url(r'^mucua/', 'mucua_get_default'),
    url(r'^(?P<repository>\w+)/mucuas', 'mucua_list'),
)

urlpatterns = format_suffix_patterns(urlpatterns)
