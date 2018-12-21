from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from media import views as media_views

urlpatterns = [
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/' +
        '(?P<width>[0-9]{1,4})x(?P<height>[0-9]{1,4})\.(?P<format_type>[a-zA-Z]{3,4})$', media_views.show_image),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/url$', media_views.media_url),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/whereis$', media_views.media_where_is),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/drop$', media_views.media_drop_copy),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/remove$', media_views.media_remove),   
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/(?P<uuid>[a-z0-9\-]+)/request$', media_views.media_request_copy),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/token', media_views.media_token),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/last/limit/' +
        '(?P<limit>[\d]*)$', media_views.media_last),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/last',
        media_views.media_last),
    url(r'^(?P<repository>\w+)/(?P<mucua>rede)/bbx/search/' +
        '(?P<args>[\w\/\-_\ \@\.]*)$', media_views.media_list),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/bbx/search/' +
        '(?P<args>[\w\/\-_\ \@\.]*)$', media_views.media_list),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/mocambola/' +
        '(?P<username>[a-zA-Z0-9\-\.@]+)/media/limit/(?P<limit>[0-9]+)', media_views.media_by_mocambola),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/mocambola/' +
        '(?P<username>[a-zA-Z0-9\-\.@]+)/media', media_views.media_by_mocambola),
    url(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-]+)/media/' +
        '(?P<pk>[\w\-]*)$', media_views.media_detail),
    url(r'^medias/(?P<pk>[0-9]+)/$', media_views.media_detail),
]
urlpatterns = format_suffix_patterns(urlpatterns)
