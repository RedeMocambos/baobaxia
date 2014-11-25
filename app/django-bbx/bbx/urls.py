from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^api/admin/', include(admin.site.urls)),
                       url(r'^api/', include('lang.urls')),
                       url(r'^cache/', include('media.urls')),
                       url(r'^api/', include('media.urls')),
                       url(r'^api/', include('repository.urls')),
                       url(r'^api/', include('mucua.urls')),
                       url(r'^api/', include('mocambola.urls')),
                       )
