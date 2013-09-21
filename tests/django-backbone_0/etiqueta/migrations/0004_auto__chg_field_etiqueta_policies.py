# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Etiqueta.policies'
        db.alter_column(u'etiqueta_etiqueta', 'policies', self.gf('bbx.utils.MultiSelectField')(max_length=100))

    def backwards(self, orm):

        # Changing field 'Etiqueta.policies'
        db.alter_column(u'etiqueta_etiqueta', 'policies', self.gf('django.db.models.fields.CharField')(max_length=100))

    models = {
        u'etiqueta.etiqueta': {
            'Meta': {'ordering': "('etiqueta',)", 'unique_together': "(('namespace', 'etiqueta'),)", 'object_name': 'Etiqueta'},
            'etiqueta': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('bbx.utils.MultiSelectField', [], {'max_length': '100', 'blank': 'True'})
        }
    }

    complete_apps = ['etiqueta']