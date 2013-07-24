# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Etiqueta'
        db.create_table(u'etiqueta_etiqueta', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('namespace', self.gf('django.db.models.fields.CharField')(default='', max_length=10, blank=True)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('etiqueta', self.gf('django.db.models.fields.CharField')(max_length=26)),
        ))
        db.send_create_signal(u'etiqueta', ['Etiqueta'])

        # Adding unique constraint on 'Etiqueta', fields ['namespace', 'etiqueta']
        db.create_unique(u'etiqueta_etiqueta', ['namespace', 'etiqueta'])


    def backwards(self, orm):
        # Removing unique constraint on 'Etiqueta', fields ['namespace', 'etiqueta']
        db.delete_unique(u'etiqueta_etiqueta', ['namespace', 'etiqueta'])

        # Deleting model 'Etiqueta'
        db.delete_table(u'etiqueta_etiqueta')


    models = {
        u'etiqueta.etiqueta': {
            'Meta': {'ordering': "('etiqueta',)", 'unique_together': "(('namespace', 'etiqueta'),)", 'object_name': 'Etiqueta'},
            'etiqueta': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'})
        }
    }

    complete_apps = ['etiqueta']