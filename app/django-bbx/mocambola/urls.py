from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns(
    'mocambola.views',
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/mocambola/' +
        '(?P<mocambola>[\w@\.]*)$', 'mocambola_detail'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/mocambola/list',
        'mocambola_list'),
)

urlpatterns = format_suffix_patterns(urlpatterns)
