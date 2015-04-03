# -*- coding: utf-8 -*-
import os
import logging
import urllib2

from django.core.management.base import BaseCommand
from django.utils.translation import ugettext_lazy as _

from lang.views import parse_templates
from bbx.settings import LANGUAGES, LANGUAGE_CODE, TEMPLATE_DIRS, PROJECT_ROOT, DEFAULT_MUCUA

"""
Definicoes do comando para atualizar templates partir dos locales
"""

class Command(BaseCommand):
    """Recria os templates de todos os locales ou de um locale especifico """
    help = 'Update templates from locales.'
    args = '[lang-code]'

    def handle(self, *args, **options):
        """
        1) check inside template_dirs if language_code folders are created.        
        2) for each language, list modules and files and generate the static templates
        """
        
        lang_codes = []
        print _('Updating templates...')
        
        """ check if lang is accepted """
        if args != ():
            for lang in LANGUAGES:
                for arg in args:
                    if arg in lang:
                        lang_codes.append(arg)
            if not lang_codes:
                print _('Language code not supported:')
                print arg
                return False
        else:
            for lang in LANGUAGES:
                lang_codes.append(lang[0])
        
        tpl_src = os.path.join(PROJECT_ROOT, 'bbx', 'templates')
        api_url = 'http://' + DEFAULT_MUCUA + '/api/templates/'

        """ generate templates for each language """
        for lang_code in lang_codes:
            tpl_parse = os.path.join(PROJECT_ROOT, 'bbx', 'static', 'templates', lang_code)

            """ check and create folder for language """
            if not os.path.isdir(tpl_parse):
                print _('...created folder ') + lang_code
                os.mkdir(tpl_parse)

            print "........................"
            print _("Parsing templates: ") + lang_code
            for root, subdirs, files in os.walk(tpl_src):
                module_name = root.rsplit('/', 1)[1]

                """ check and create folder module """
                module_folder = os.path.join(tpl_parse, module_name)
                if not os.path.isdir(module_folder):
                    os.mkdir(module_folder)

                for template_name in files:
                    template_api_url = api_url + lang_code + '/' + module_name + '/' + template_name
                    req = urllib2.Request(template_api_url)
                    u = urllib2.urlopen(req)
                    template_content = u.read()

                    template_filename = os.path.join(module_folder, template_name)
                    print template_filename
                    if os.path.isfile(template_filename):
                        os.remove(template_filename)
                    f = open(template_filename, 'w')
                    f.write(template_content)
                    f.close()
