import json

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.template import Template, RequestContext
from django.http import HttpResponse

from bbx.settings import DEFAULT_LANG, INSTALLED_LANGS
from bbx.utils import logger

@api_view(['GET'])
def default_lang(request):
    
    response_data = {
        'defaultLang': DEFAULT_LANG
    }
    logger.info('default_lang')
    return HttpResponse(json.dumps(response_data), mimetype=u'application/json')

@api_view(['GET'])
def available_langs(request):
    
    response_data = {
        'availableLangs': INSTALLED_LANGS
    }
    logger.info('availableLangs')
    return HttpResponse(json.dumps(response_data), mimetype=u'application/json')

@api_view(['GET'])
def get_lang(request, lang):
    logger.info('get_lang: ' + lang)
    if lang not in INSTALLED_LANGS:
        response_data = {
            'error': True,
            'errorMessage': 'Language "' + lang + '" not installed'
        }
        return HttpResponse(json.dumps(response_data), mimetype=u'application/json')
    
    # if language exists, continue
    
    langs = {
        'pt-br': {
            'login': 'entrar'
        },
        'en' : {
            'login': 'login'
        }
    }
    
    response_data = {
        'strings': langs[lang]
    }
    
    return HttpResponse(json.dumps(response_data), mimetype=u'application/json')
    
