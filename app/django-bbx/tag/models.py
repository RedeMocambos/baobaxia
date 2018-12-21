# -*- coding: utf-8 -*-

"""
 Tags (etiqueta) in Bbx define some behaviours of the system, beside qualifying
 contents. Each tag can be associated to a set of policies
 (POLICIES_DIR).

 Actually policies will be linked to Django Signals selected by name. For
 example, a policy called "postSave_copyToTaina" is imported and executed
 on post save signals.

 TODO: O arquivo  na real contem a função mesmo.. não precisa de
       json. As tags periodicamenta vão ser definidas e carregada
       com as fixtures.

"""

import os
#import exceptions

from django.db import models
from bbx.settings import POLICIES_DIR
#from bbx.utils import MultiSelectField
from multiselectfield import MultiSelectField

# This is to specify to south how to work with MultiSelectField:
# http://south.readthedocs.org/en/latest/customfields.html
#from south.modelsinspector import add_introspection_rules
#add_introspection_rules([], ["bbx.utils.MultiSelectField"])


#class PoliciesPersistentDataUnavailable(exceptions.Exception):
#    def __init__(self, args=None):
#        self.args = args


def get_available_policies():
    """Retorna a lista de politicas disponíveis em POLICIES_DIR."""
    policy_list = [(os.path.splitext(name)[0], os.path.splitext(name)[0]) for
                    name in os.listdir(POLICIES_DIR) if name.endswith(".py") if
                    not (name.startswith("__"))]
    return policy_list


class Tag(models.Model):
    namespace = models.CharField(max_length=60, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    name = models.CharField(max_length=26)
    policies = MultiSelectField(max_length=100,
                                choices=get_available_policies(),
                                blank=True)

    def __unicode__(self):
        return (self.namespace + ":" + self.name if self.namespace != '' else
                self.name)

    def get_id(self):
        """
        Retorna o id da etiqueta 

        Por ex.:  bbx:publico 
        """
        return (self.namespace + ":" + self.name if self.namespace != '' else
                self.name)

    def _get_policies_filename(self):
        """Retorna o nome do arquivo das politicas"""
        return POLICIES_DIR + '/' + self.get_id() + '.json'

    def set_namespace(self):
        """Imposta o namespace da etiqueta"""
        if len(self.namespace) > 0:
            return
        if self.name.find(':') > 0:
            args = self.name.split(':')
            self.namespace = args[0]
        else:
            from mucua.models import get_default_mucua
            self.namespace = get_default_mucua().uuid + '-tag'

    def save(self, *args, **kwargs):
        """
        Save also tag's policies to a JSON file.

        """

        self.set_namespace()
        super(Tag, self).save(*args, **kwargs)

    class Meta:
        ordering = ('name',)
        unique_together = ("namespace", "name")
