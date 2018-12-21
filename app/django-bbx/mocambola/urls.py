from django.urls import re_path
from rest_framework.urlpatterns import format_suffix_patterns

from mocambola import views as mocambola_views
urlpatterns = [
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/mocambola/list',
        mocambola_views.mocambola_list),
    re_path(r'^\w+/[a-zA-Z0-9\-\[\]]+/mocambola/login',
        mocambola_views.login),
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/mocambola/' +
        '(?P<mocambola>[a-zA-Z0-9\-\.@]+)$', mocambola_views.mocambola_detail),
    re_path(r'^mocambola/register', mocambola_views.create_auth),
]

urlpatterns = format_suffix_patterns(urlpatterns)
