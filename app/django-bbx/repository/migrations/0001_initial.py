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
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('enable_sync', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'repository', ['Repository'])


    def backwards(self, orm):
        # Deleting model 'Repository'
        db.delete_table(u'repository_repository')


    models = {
        u'repository.repository': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Repository'},
            'enable_sync': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'})
        }
    }

    complete_apps = ['repository']