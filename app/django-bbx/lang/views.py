import json
import os

from rest_framework.decorators import api_view
#from rest_framework.decorators import authentication_classes, permission_classes

from rest_framework.response import Response
from rest_framework import status

from django.template import Template, RequestContext
from django.http import HttpResponse
from django.utils import translation
from django.utils.translation import ugettext as _
from django.shortcuts import render
from django.conf.urls import i18n 


from bbx.settings import LANGUAGES, LANGUAGE_CODE, TEMPLATES
from bbx.utils import logger


TEMPLATES_PATH = TEMPLATES[0]['DIRS'][0]

@api_view(['GET'])
def default_lang(request):

    response_data = {
        'defaultLang': LANGUAGE_CODE
    }
    logger.info('default_lang')
    return HttpResponse(json.dumps(response_data), mimetype='application/json')

@api_view(['POST'])
def change_interface_lang(request):
    logger.info('change default lang')
    
    new_lang = request.POST.get('new_lang').encode('utf-8')
    current_lang = request.POST.get('current_lang').encode('utf-8')
    response_data = {
        'new_lang' : new_lang
    }
    logger.info(current_lang)
    logger.info(new_lang)
    
    # change default language at bbx application
    bbx_config_file = os.path.join(os.getcwd(), 'bbx/static/js/config.js')
    current_lang = current_lang.encode('utf-8')
    new_lang = new_lang.encode('utf-8')
    
    lines = []    
    with open(bbx_config_file) as infile:
        for line in infile:
            line = line.replace(current_lang, new_lang)
            lines.append(line)
    with open(bbx_config_file, 'w') as outfile:
        for line in lines:
            outfile.write(line)

    # precisa rodar update_templates
    # precisa rodar collectstatic
    
    from django.core.management import call_command
    call_command('update_templates', new_lang, interactive=False)
    call_command('collectstatic', interactive=False)    
    
    return HttpResponse(json.dumps(response_data), mimetype='application/json')
    
@api_view(['GET'])
def available_langs(request):
    
    response_data = {
        'availableLangs': LANGUAGES
    }
    logger.info('availableLangs')
    return HttpResponse(json.dumps(response_data), mimetype='application/json')
    
@api_view(['GET'])
def parse_templates(request, module_name, template_name, lang):
    if not any(lang in LANGUAGE for LANGUAGE in LANGUAGES):
        response_data = {
            'error': True,
            'errorMessage': _('Language not installed: ') + lang
        }
        return HttpResponse(json.dumps(response_data), mimetype='application/json')

    translation.activate(lang)
    request.session['django_language'] = lang    
    
    module_path = os.path.join(TEMPLATES_PATH, module_name)
    template_name = os.path.join(TEMPLATES_PATH, module_name, template_name)
    
    # check if module exists    
    module_exists = os.path.isdir(os.path.join(TEMPLATES_PATH, module_name))
    if not module_exists:
        response_data = {
            'error': True,
            'errorMessage': _('Module does not exists: ') + module_path
        }
        return HttpResponse(json.dumps(response_data), mimetype='application/json')
    
    # check if template exists
    template_exists = os.path.isfile(template_name)
    if not template_exists:
        response_data = {
            'error': True,
            'errorMessage': _("Template does not exists: ") + template_name,
        }
        return HttpResponse(json.dumps(response_data), mimetype='application/json')
    
    return render(request, template_name)
