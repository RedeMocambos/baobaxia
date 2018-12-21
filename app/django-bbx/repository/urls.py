from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from repository import views as repo_views

urlpatterns = [
    url(r'^repository/list', repo_views.repository_list),
    url(r'^repository/', repo_views.repository_get_default),
]

urlpatterns = format_suffix_patterns(urlpatterns)
