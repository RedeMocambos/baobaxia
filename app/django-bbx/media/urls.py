from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

#    url(r'^images/(?P<pk>[\w\-]*)_(?P<width>[\d]*)x(?P<height>[\d])\.(?P<format_type>[a-zA-Z]{3,4})', 'get_image'),
# (?P<format_type>[a-zA-Z]{3,4})$', 'get_image'),
# images/5555-5222-5515-1111_
urlpatterns = patterns('media.views',
    url(r'^(?P<uuid>[\w\-]*)_(?P<width>[\d]*)x(?P<height>[\d]*)\.(?P<format_type>[\w]{3,4})$', 'show_image'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/media/last/(?P<qtd>[\d]*)$', 'media_last'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/media/last', 'media_last'),
    url(r'^(?P<repository>\w+)/(?P<mucua>rede)/bbx/search/(?P<args>[\w\/-_]*)$', 'media_list'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/bbx/search/(?P<args>[\w\/-_]*)$', 'media_list'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/media/(?P<pk>[\w\-]*)$', 'media_detail'),
    url(r'^medias/(?P<pk>[0-9]+)/$', 'media_detail'),
)
urlpatterns = format_suffix_patterns(urlpatterns)
