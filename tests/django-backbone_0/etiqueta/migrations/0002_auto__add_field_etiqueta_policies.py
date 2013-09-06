# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Etiqueta.policies'
        db.add_column(u'etiqueta_etiqueta', 'policies',
                      self.gf('django.db.models.fields.CharField')(default='sync', unique=True, max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Etiqueta.policies'
        db.delete_column(u'etiqueta_etiqueta', 'policies')


    models = {
        u'etiqueta.etiqueta': {
            'Meta': {'ordering': "('etiqueta',)", 'unique_together': "(('namespace', 'etiqueta'),)", 'object_name': 'Etiqueta'},
            'etiqueta': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('django.db.models.fields.CharField', [], {'default': "'sync'", 'unique': 'True', 'max_length': '100'})
        }
    }

    complete_apps = ['etiqueta']