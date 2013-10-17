# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Repository'
        db.create_table(u'repository_repository', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('repositoryName', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('syncStartTime', self.gf('django.db.models.fields.DateField')()),
            ('enableSync', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('remoteRepositoryURLOrPath', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'repository', ['Repository'])


    def backwards(self, orm):
        # Deleting model 'Repository'
        db.delete_table(u'repository_repository')


    models = {
        u'repository.repository': {
            'Meta': {'ordering': "('repositoryName',)", 'object_name': 'Repository'},
            'enableSync': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'remoteRepositoryURLOrPath': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'repositoryName': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'syncStartTime': ('django.db.models.fields.DateField', [], {})
        }
    }

    complete_apps = ['repository']