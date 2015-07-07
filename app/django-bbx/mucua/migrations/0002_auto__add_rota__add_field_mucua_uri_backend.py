# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Rota'
        db.create_table(u'mucua_rota', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('mucua', self.gf('django.db.models.fields.related.ForeignKey')(related_name='rota_mucuas', to=orm['mucua.Mucua'])),
            ('mucuia', self.gf('django.db.models.fields.related.ForeignKey')(related_name='rota_mucuias', to=orm['mucua.Mucua'])),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('is_active', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('is_available', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('weight', self.gf('django.db.models.fields.CharField')(default='100', max_length=100)),
        ))
        db.send_create_signal(u'mucua', ['Rota'])

        # Adding field 'Mucua.uri_backend'
        db.add_column(u'mucua_mucua', 'uri_backend',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=2048),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'Rota'
        db.delete_table(u'mucua_rota')

        # Deleting field 'Mucua.uri_backend'
        db.delete_column(u'mucua_mucua', 'uri_backend')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'mocambola.mocambola': {
            'Meta': {'object_name': 'Mocambola'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mucua': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mucua.Mucua']"}),
            'repository': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['repository.Repository']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'mocambola'", 'unique': 'True', 'to': u"orm['auth.User']"})
        },
        u'mucua.mucua': {
            'Meta': {'ordering': "('description',)", 'object_name': 'Mucua'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mocambolas': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.User']", 'through': u"orm['mocambola.Mocambola']", 'symmetrical': 'False'}),
            'mucuas': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'linked_mucuas'", 'symmetrical': 'False', 'through': u"orm['mucua.Rota']", 'to': u"orm['mucua.Mucua']"}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'repository': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['repository.Repository']", 'symmetrical': 'False'}),
            'uri_backend': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2048'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'dandara'", 'max_length': '36'})
        },
        u'mucua.rota': {
            'Meta': {'ordering': "('description',)", 'object_name': 'Rota'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_available': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'mucua': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'rota_mucuas'", 'to': u"orm['mucua.Mucua']"}),
            'mucuia': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'rota_mucuias'", 'to': u"orm['mucua.Mucua']"}),
            'weight': ('django.db.models.fields.CharField', [], {'default': "'100'", 'max_length': '100'})
        },
        u'repository.repository': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Repository'},
            'enable_sync': ('django.db.models.fields.BooleanField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'})
        }
    }

    complete_apps = ['mucua']