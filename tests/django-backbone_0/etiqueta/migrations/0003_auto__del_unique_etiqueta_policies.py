# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing unique constraint on 'Etiqueta', fields ['policies']
        db.delete_unique(u'etiqueta_etiqueta', ['policies'])


    def backwards(self, orm):
        # Adding unique constraint on 'Etiqueta', fields ['policies']
        db.create_unique(u'etiqueta_etiqueta', ['policies'])


    models = {
        u'etiqueta.etiqueta': {
            'Meta': {'ordering': "('etiqueta',)", 'unique_together': "(('namespace', 'etiqueta'),)", 'object_name': 'Etiqueta'},
            'etiqueta': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'})
        }
    }

    complete_apps = ['etiqueta']