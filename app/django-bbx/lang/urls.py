from django.urls import path, re_path

from rest_framework.urlpatterns import format_suffix_patterns

from .views import available_langs, change_interface_lang, default_lang, parse_templates

urlpatterns = [
#    re_path('^lang/', lang_views),
    re_path(r'^lang/available', available_langs),
    re_path(r'^lang/change_interface_lang', change_interface_lang),    
    re_path(r'^lang', default_lang),
    re_path(r'^templates/(?P<lang>[a-zA-Z\_\-]+)/(?P<module_name>[a-zA-Z]+)/(?P<template_name>[a-zA-Z0-9\-\_\.]+)', parse_templates),
]
urlpatterns = format_suffix_patterns(urlpatterns)

