# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Mocambola'
        db.create_table(u'mocambola_mocambola', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('mucua', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['mucua.Mucua'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('repository', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['repository.Repository'])),
        ))
        db.send_create_signal(u'mocambola', ['Mocambola'])


    def backwards(self, orm):
        # Deleting model 'Mocambola'
        db.delete_table(u'mocambola_mocambola')


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
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
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
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'mucua.mucua': {
            'Meta': {'ordering': "('description',)", 'object_name': 'Mucua'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mocambolas': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'mucuas'", 'symmetrical': 'False', 'through': u"orm['mocambola.Mocambola']", 'to': u"orm['auth.User']"}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'repository': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'mucuas'", 'symmetrical': 'False', 'to': u"orm['repository.Repository']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'dandara'", 'max_length': '36'})
        },
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

    complete_apps = ['mocambola']