# -*- coding: utf-8 -*-

from django.db import models
#from repository.models import Repository
from django.conf import settings
#from repository.models import gitAnnexStatus
from django.contrib.auth.models import User
from bbx.settings import DEFAULT_REPOSITORY, DEFAULT_MUCUA
from django.db.models import get_model
from django.db.utils import DatabaseError
import exceptions

# MUCUA_NAME_UUID é uma tupla com nome e uuid da mucua (pode ler do settings.py)
# MUCUA_NAME_UUID = settings.MUCUA_NAME_UUID
# MUCUA_NAME_UUID = [ ('a30a926a-3a8c-11e2-a817-cb26bd9bc8d3','dandara'), ('0492621a-4195-11e2-b8c7-43de40a4e11c','acotirene') ]

def getAvailableMucuas(uuid=None, repository=None):
    """Get a list of available policies from POLICIES_DIR."""

    if not repository:
        try:
#            repository_model = get_model('repository', 'Repository')
            from repository.models import getDefaultRepository
            repository = getDefaultRepository()
        except DatabaseError:
            return []
    
    import json
    from repository.models import gitAnnexStatus
    jsonRepositoryStatus = json.loads(gitAnnexStatus(repository.getPath()))
    
    if uuid:
        for mucua in jsonRepositoryStatus['semitrusted repositories']:
            if mucua['uuid'] == uuid:
                print "Mucua description: ", mucua['description'] 
                return mucua['description'] 
    else:
        return [( mucua['uuid'], mucua['description'] ) for mucua in jsonRepositoryStatus['semitrusted repositories']]     


class RepositoryDoesNotExist(exceptions.Exception):
    def __init__(self,args=None):
        self.args = args


class Mucua(models.Model):
    description = models.CharField(max_length=100, editable=False)
    note = models.TextField(max_length=300, blank=True)
    uuid = models.CharField(max_length=36, choices=getAvailableMucuas(), default='dandara')
    repository = models.ManyToManyField('repository.Repository', related_name='mucuas')
    mocambolas = models.ManyToManyField(User, through='mocambola.Mocambola', related_name='mucuas')

    def getDescription(self):
        return self.description

    def save(self, *args, **kwargs):
        print "Self.uuid: ", self.uuid
        self.description = getAvailableMucuas(uuid=self.uuid)
        super(Mucua, self).save(*args, **kwargs) # Call the "real" save() method.
    
    def __unicode__(self):
        return self.description

    class Meta:
        ordering = ('description',)
