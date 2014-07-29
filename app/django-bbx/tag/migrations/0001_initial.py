# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Tag'
        db.create_table(u'tag_tag', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('namespace', self.gf('django.db.models.fields.CharField')(default='', max_length=10, blank=True)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=26)),
            ('policies', self.gf('bbx.utils.MultiSelectField')(max_length=100, blank=True)),
        ))
        db.send_create_signal(u'tag', ['Tag'])

        # Adding unique constraint on 'Tag', fields ['namespace', 'name']
        db.create_unique(u'tag_tag', ['namespace', 'name'])


    def backwards(self, orm):
        # Removing unique constraint on 'Tag', fields ['namespace', 'name']
        db.delete_unique(u'tag_tag', ['namespace', 'name'])

        # Deleting model 'Tag'
        db.delete_table(u'tag_tag')


    models = {
        u'tag.tag': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('namespace', 'name'),)", 'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('bbx.utils.MultiSelectField', [], {'max_length': '100', 'blank': 'True'})
        }
    }

    complete_apps = ['tag']