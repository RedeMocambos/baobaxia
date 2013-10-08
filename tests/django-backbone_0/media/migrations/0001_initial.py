# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Media'
        db.create_table(u'media_media', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('uuid', self.gf('django.db.models.fields.CharField')(default='aacf9d04-41ee-46b1-b9c4-e43bbaa9a633', max_length=36)),
            ('title', self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True)),
            ('comment', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('origin', self.gf('django.db.models.fields.related.ForeignKey')(related_name='media', to=orm['mucua.Mucua'])),
            ('type', self.gf('django.db.models.fields.CharField')(default='arquivo', max_length=14, blank=True)),
            ('format', self.gf('django.db.models.fields.CharField')(default='ogg', max_length=14, blank=True)),
            ('license', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('mediafile', self.gf('django.db.models.fields.files.FileField')(max_length=100, blank=True)),
            ('repository', self.gf('django.db.models.fields.related.ForeignKey')(related_name='media', to=orm['repository.Repository'])),
        ))
        db.send_create_signal(u'media', ['Media'])

        # Adding M2M table for field tags on 'Media'
        m2m_table_name = db.shorten_name(u'media_media_tags')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('media', models.ForeignKey(orm[u'media.media'], null=False)),
            ('tag', models.ForeignKey(orm[u'tag.tag'], null=False))
        ))
        db.create_unique(m2m_table_name, ['media_id', 'tag_id'])


    def backwards(self, orm):
        # Deleting model 'Media'
        db.delete_table(u'media_media')

        # Removing M2M table for field tags on 'Media'
        db.delete_table(db.shorten_name(u'media_media_tags'))


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
        u'media.media': {
            'Meta': {'ordering': "('date',)", 'object_name': 'Media'},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'comment': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'format': ('django.db.models.fields.CharField', [], {'default': "'ogg'", 'max_length': '14', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'license': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'mediafile': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'blank': 'True'}),
            'origin': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'media'", 'to': u"orm['mucua.Mucua']"}),
            'repository': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'media'", 'to': u"orm['repository.Repository']"}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'tags'", 'symmetrical': 'False', 'to': u"orm['tag.Tag']"}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'arquivo'", 'max_length': '14', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'aacf9d04-41ee-46b1-b9c4-e43bbaa9a633'", 'max_length': '36'})
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
            'repository': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'mucuas'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['repository.Repository']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'dandara'", 'max_length': '36'})
        },
        u'repository.repository': {
            'Meta': {'ordering': "('repositoryName',)", 'object_name': 'Repository'},
            'enableSync': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mucua': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'repos'", 'symmetrical': 'False', 'to': u"orm['mucua.Mucua']"}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'remoteRepositoryURLOrPath': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'repositoryName': ('django.db.models.fields.CharField', [], {'default': "'redemocambos'", 'unique': 'True', 'max_length': '100'}),
            'repositoryURLOrPath': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'syncStartTime': ('django.db.models.fields.DateField', [], {})
        },
        u'tag.tag': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('namespace', 'name'),)", 'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '26'}),
            'namespace': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'policies': ('bbx.utils.MultiSelectField', [], {'max_length': '100', 'blank': 'True'})
        }
    }

    complete_apps = ['media']