#from django.conf.urls import include, url
from django.urls import re_path, include

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    re_path(r'^api/admin/', admin.site.urls),
    re_path(r'^api/', include('lang.urls')),
    re_path(r'^cache/', include('media.urls')),
    re_path(r'^api/', include('media.urls')),
    re_path(r'^api/', include('repository.urls')),
    re_path(r'^api/', include('mucua.urls')),
    re_path(r'^api/', include('mocambola.urls')),
    re_path(r'^api/', include('tag.urls')),
]
