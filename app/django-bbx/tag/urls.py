from django.urls import re_path
from rest_framework.urlpatterns import format_suffix_patterns

from tag import views as tag_views

urlpatterns = [
    re_path(r'tags/functional_tag/' + 
        '(?P<tags>[\w\/\-_\ ]*)$', tag_views.check_functional_tags),    
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/tags/search/' + 
        '(?P<args>[\w\/\-_\ ]*)$', tag_views.search_tags),
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/tags/' + 
        '(?P<args>[\w\/\-_\ ]+)$', tag_views.search_related_tags),
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/tags/',
        tag_views.mucua_tags),   
    re_path(r'^(?P<repository>\w+)/(?P<mucua>[a-zA-Z0-9\-\[\]]+)/tags',
        tag_views.mucua_tags),   
]

urlpatterns = format_suffix_patterns(urlpatterns)
