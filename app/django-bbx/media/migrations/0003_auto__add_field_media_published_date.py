# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Media.published_date'
        db.add_column(u'media_media', 'published_date',
                      self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Media.published_date'
        db.delete_column(u'media_media', 'published_date')


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
        u'media.media': {
            'Meta': {'ordering': "('date',)", 'object_name': 'Media'},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'date': ('django.db.models.fields.DateTimeField', [], {}),
            'format': ('django.db.models.fields.CharField', [], {'default': "'ogg'", 'max_length': '14', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_local': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_requested': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2017, 7, 7, 0, 0)'}),
            'license': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'media_file': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "u'No title'", 'max_length': '100'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'num_copies': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'origin': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mucua.Mucua']"}),
            'published_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'repository': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['repository.Repository']"}),
            'request_code': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['tag.Tag']", 'symmetrical': 'False', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'arquivo'", 'max_length': '14', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "u'No UUID'", 'max_length': '36'})
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
            'uri_backend': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2048', 'blank': 'True'}),
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
        },
        u'tag.tag': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('namespace', 'name'),)", 'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '60', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('bbx.utils.MultiSelectField', [], {'max_length': '100', 'blank': 'True'})
        }
    }

    complete_apps = ['media']