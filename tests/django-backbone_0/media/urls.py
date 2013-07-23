from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns('media.views',
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/medias/(?P<args>[\w\/]+)$', 'media_list'),
    url(r'^(?P<repository>\w+)/(?P<mucua>\w+)/medias/$', 'media_list'),
    url(r'^medias/(?P<pk>[0-9]+)/$', 'media_detail'),
    url(r'^medias/publish', 'publish'),
)


urlpatterns = format_suffix_patterns(urlpatterns)
