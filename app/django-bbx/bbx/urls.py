from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', 'bbx.views.home', name='home'),
                       # url(r'^bbx/', include('bbx.foo.urls')),
                       # Uncomment the admin/doc line below to enable admin
                       # documentation:
                       # url(r'^admin/doc/',
                       #     include('django.contrib.admindocs.urls')),
                       url(r'^api/admin/', include(admin.site.urls)),
                       url(r'^cache/', include('media.urls')),
                       url(r'^api/', include('media.urls')),
                       url(r'^api/', include('repository.urls')),
                       url(r'^api/', include('mucua.urls')),
                       url(r'^api/', include('mocambola.urls')),
                       )
