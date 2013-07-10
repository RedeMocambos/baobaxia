from django.conf.urls import patterns, url

urlpatterns = patterns('media.views',
    url(r'^medias/$', 'media_list'),
    url(r'^medias/(?P<pk>[0-9]+)/$', 'media_detail'),
)
