from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns(
    'media.views',
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/' +
        '(?P<width>[0-9]{2,4})x(?P<height>[0-9]{2,4})\.(?P<format_type>[a-zA-Z]{3,4})$', 'show_image'),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/url$', 'media_url'),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/whereis$', 'media_where_is'),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/drop$', 'media_drop_copy'),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/remove$', 'media_remove'),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/request$', 'media_request_copy'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/token', 'media_token'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/last/' +
        '(?P<qtd>[\d]*)$', 'media_last'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/last',
        'media_last'),
    url(r'^(?P<repository>\w+)/(?P<mucua>rede)/bbx/search/' +
        '(?P<args>[\w\/\-_\ ]*)$', 'media_list'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/bbx/search/' +
        '(?P<args>[\w\/\-_\ ]*)$', 'media_list'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/mocambola/' +
        '(?P<username>[a-zA-Z0-9\-\.@]+)/media/limit/(?P<limit>[0-9]+)', 'media_by_mocambola'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/mocambola/' +
        '(?P<username>[a-zA-Z0-9\-\.@]+)/media', 'media_by_mocambola'),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/' +
        '(?P<pk>[\w\-]*)$', 'media_detail'),
    url(r'^medias/(?P<pk>[0-9]+)/$', 'media_detail'),
)
urlpatterns = format_suffix_patterns(urlpatterns)
