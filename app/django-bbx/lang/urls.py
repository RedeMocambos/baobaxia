from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = patterns(
    'lang.views',
    url(r'^lang/available', 'available_langs'),
    url(r'^lang', 'default_lang'),
    url(r'^templates/(?P<lang>[a-zA-Z\_\-]+)/(?P<module_name>[a-zA-Z]+)/(?P<template_name>[a-zA-Z0-9\-\_\.]+)', 'parse_templates'),
)
urlpatterns = format_suffix_patterns(urlpatterns)

