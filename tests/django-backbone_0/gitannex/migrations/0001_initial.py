# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Repository'
        db.create_table(u'gitannex_repository', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('note', self.gf('django.db.models.fields.TextField')(max_length=300, blank=True)),
            ('repositoryName', self.gf('django.db.models.fields.CharField')(default='redemocambos', unique=True, max_length=100)),
            ('repositoryURLOrPath', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('syncStartTime', self.gf('django.db.models.fields.DateField')()),
            ('enableSync', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('remoteRepositoryURLOrPath', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'gitannex', ['Repository'])

        # Adding M2M table for field uuid on 'Repository'
        m2m_table_name = db.shorten_name(u'gitannex_repository_uuid')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('repository', models.ForeignKey(orm[u'gitannex.repository'], null=False)),
            ('mucua', models.ForeignKey(orm[u'mucua.mucua'], null=False))
        ))
        db.create_unique(m2m_table_name, ['repository_id', 'mucua_id'])


    def backwards(self, orm):
        # Deleting model 'Repository'
        db.delete_table(u'gitannex_repository')

        # Removing M2M table for field uuid on 'Repository'
        db.delete_table(db.shorten_name(u'gitannex_repository_uuid'))


    models = {
        u'gitannex.repository': {
            'Meta': {'ordering': "('repositoryName',)", 'object_name': 'Repository'},
            'enableSync': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'remoteRepositoryURLOrPath': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'repositoryName': ('django.db.models.fields.CharField', [], {'default': "'redemocambos'", 'unique': 'True', 'max_length': '100'}),
            'repositoryURLOrPath': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'syncStartTime': ('django.db.models.fields.DateField', [], {}),
            'uuid': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['mucua.Mucua']"})
        },
        u'mucua.mucua': {
            'Meta': {'ordering': "('description',)", 'object_name': 'Mucua'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'max_length': '300', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'dandara'", 'max_length': '36'})
        }
    }

    complete_apps = ['gitannex']