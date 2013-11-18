from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns('repository.views',
    url(r'^repository/list', 'repository_list'),
    url(r'^repository/', 'repository_get_default'),
)

urlpatterns = format_suffix_patterns(urlpatterns)
