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

from django.db import models
from bbx.settings import POLICIES_DIR
from bbx.utils import MultiSelectField
import os
import exceptions

# This is to specify to south how to work with MultiSelectField:
# http://south.readthedocs.org/en/latest/customfields.html
from south.modelsinspector import add_introspection_rules
add_introspection_rules([], ["bbx.utils.MultiSelectField"])


class PoliciesPersistentDataUnavailable(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args


def getAvailablePolicies():
    """Get a list of available policies from POLICIES_DIR."""
    policiesList = [(os.path.splitext(name)[0], os.path.splitext(name)[0]) for
                    name in os.listdir(POLICIES_DIR) if name.endswith(".py") if
                    not (name.startswith("__"))]
    return policiesList


class Tag(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    name = models.CharField(max_length=26)
    policies = MultiSelectField(max_length=100,
                                choices=getAvailablePolicies(),
                                blank=True)

    def __unicode__(self):
        return (self.namespace + ":" + self.name if self.namespace != '' else
                self.name)

    def getId(self):
        """
        Returns tag's id built as namespace + name, ex.:
        bbx:publico ("name" attribute shoul'd be "name" FIX:
        rename!)

        """
        return (self.namespace + ":" + self.name if self.namespace != '' else
                self.name)

    def _getPoliciesFilename(self):
        """
        Policies file is built with POLICIES_DIR and tag's id

        """
        return POLICIES_DIR + '/' + self.getId() + '.json'

    def setNamespace(self):
        """
        Sets tag's namespace like in bbx:publico gets "bbx" :)

        """
        if self.name.find(':') > 0:
            args = self.name.split(':')
            self.namespace = args[0]

    def setName(self):
        """
        Sets tag's name. FIX

        """
        if self.name.find(':') > 0:
            args = self.name.split(':')
            self.name = args[1]

    def save(self, *args, **kwargs):
        """
        Save also tag's policies to a JSON file.

        """

        self.setNamespace()
        self.setName()
        super(Tag, self).save(*args, **kwargs)

    class Meta:
        ordering = ('name',)
        unique_together = ("namespace", "name")
