from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns(
    'lang.views',
    url(r'^lang/available', 'available_langs'),
    url(r'^lang/(?P<lang>[a-zA-Z\-]+)', 'get_lang'),
    url(r'^lang', 'default_lang'),
)
urlpatterns = format_suffix_patterns(urlpatterns)

