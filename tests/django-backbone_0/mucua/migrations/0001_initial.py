# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Mucua'
        db.create_table(u'mucua_mucua', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('uuid', self.gf('django.db.models.fields.CharField')(default='dandara', max_length=36)),
        ))
        db.send_create_signal(u'mucua', ['Mucua'])


    def backwards(self, orm):
        # Deleting model 'Mucua'
        db.delete_table(u'mucua_mucua')


    models = {
        u'mucua.mucua': {
            'Meta': {'ordering': "('description',)", 'object_name': 'Mucua'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'dandara'", 'max_length': '36'})
        }
    }

    complete_apps = ['mucua']