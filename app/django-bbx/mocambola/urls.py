from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns(
    'mocambola.views',
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/mocambola/list',
        'mocambola_list'),
    url(r'^\w+/[a-zA-Z0-9\-\[\]]+/mocambola/login',
        'login'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/mocambola/' +
        '(?P<mocambola>[a-zA-Z0-9\-\.@]+)$', 'mocambola_detail'),
    url(r'^mocambola/register', 'create_auth'),

)

urlpatterns = format_suffix_patterns(urlpatterns)
