# -*- coding: utf-8 -*-                                                                                                                                                           
import os
import logging
import subprocess

from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

from django.utils.translation import ugettext_lazy as _
from django.core.management.base import CommandError
from django.core.exceptions import ValidationError

from media.models import Media
from repository.models import get_latest_media, get_default_repository, Repository
from bbx.settings import REPOSITORY_DIR
from bbx.utils import dumpclean

logger = logging.getLogger(__name__)


class MediaSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True,
                                        slug_field='name',
                                        read_only=True)
    origin = serializers.SlugRelatedField(many=False, slug_field='description')
    repository = serializers.SlugRelatedField(many=False, slug_field='name')
    author = serializers.SlugRelatedField(many=False, slug_field='username')
    
    class Meta:
        model = Media
        fields = ('date', 'uuid', 'name', 'note', 'author', 'type',
                  'format', 'license', 'media_file', 'url', 'origin',
                  'repository')
        depth = 1
    
    def restore_fields(self, data, files):
        u"""Converte um dicionário de dados em um dicionário de campos
        deserializados.
        """
        reverted_data = {}

        if data is not None and not isinstance(data, dict):
            self._errors['non_field_errors'] = ['Invalid data']
            return None

        for field_name, field in self.fields.items():
            field.initialize(parent=self, field_name=field_name)
            if(field_name == 'media_file'):
                # field_name = 'dataUri'
                field = serializers.CharField()
                try:
                    # restore using the built in mechanism
                    field.field_from_native(data, files, field_name,
                                            reverted_data)
                    # take the dataUri, save it to disk and return the Path
                    value = reverted_data[field_name]
                    path = value
                    # set the file <Path> property on the model,
                    # remove the old dataUri
                    reverted_data['media_file'] = path
                    del reverted_data[field_name]

                except ValidationError as err:
                    self._errors[field_name] = list(err.messages)
                else:
                    field.initialize(parent=self, field_name=field_name)
                    try:
                        field.field_from_native(data, files, field_name,
                                                reverted_data)
                    except ValidationError as err:
                        self._errors[field_name] = list(err.messages)
            else:
                try:
                    field.field_from_native(data, files, field_name,
                                            reverted_data)
                except ValidationError as err:
                    self._errors[field_name] = list(err.messages)

        return reverted_data

    def restore_object(self, attrs, instance=None):
        u"""
        Crea o atualiza um media, dado um dicionário de valores dos 
        campos deserializados.
        """
        if instance:
            # Update existing instance
            instance.date = attrs.get('date', instance.date)
            instance.uuid = attrs.get('uuid', instance.uuid)
            instance.name = attrs.get('name', instance.name)
            instance.note = attrs.get('note', instance.note)
            instance.author = attrs.get('author', instance.author)
            instance.origin = attrs.get('origin', instance.origin)
            instance.type = attrs.get('type', instance.type)
            instance.format = attrs.get('format', instance.format)
            instance.license = attrs.get('license', instance.license)
#            instance.media_file(upload_to=attrs.get('media_file',
#                                                   instance.media_file))
            instance.url = attrs.get('url',instance.url)
#            instance.tags = attrs.get('tags', instance.tags)
            instance.repository = attrs.get('repository', instance.repository)
#            instance.is_local = attrs.get('is_local', instance.is_local)
#            instance.is_requested = attrs.get('is_requested', instance.is_requested)
#            instance.request_code = attrs.get('request_code', instance.request_code)
#            instance.num_copies = attrs.get('num_copies', instance.num_copies)
            return instance
        # Create new instance
        return Media(**attrs)

    def get_pk_field(self, model_field):
        return None

    def getJSON(self):
        return JSONRenderer().render(self.data)


def create_objects_from_files(repository=get_default_repository().name):
    """Recria os midias no Django a partir dos medias serializados em JSON."""
    try:
        repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return None

    logger.info(u">>> %s" % _('DESERIALIZING'))
    logger.info(u"%s: %s" % (_('Repository'),  repository))
    logger.debug(u"%s \n %s" % (_('List of media found in repository..'), get_latest_media(repository).splitlines()))
    try:
        for serialized_media in get_latest_media(repository).splitlines():
            logger.info(u"%s: %s" % (_('Serialized Media'), serialized_media))
            media_json_file_path = os.path.join(REPOSITORY_DIR,
                                                repository.name,
                                                serialized_media)
            media_json_file = open(media_json_file_path)
            data = JSONParser().parse(media_json_file)
            
            try:
                media = Media.objects.get(uuid=data["uuid"])
                serializer = MediaSerializer(media, data=data, partial=True)
                print serializer.is_valid()
                print serializer.errors
                serializer.object.save()            
                logger.info(u"%s" % _('This media already exist. Updated.'))
                
            except Media.DoesNotExist:
                #dumpclean(data)
                serializer = MediaSerializer(data=data)
                print serializer.is_valid()
                print serializer.errors
                serializer.object.save()
                logger.info(u"%s" % _('New media created'))
            

            # Atualiza o arquivo lastSyncMark
            path = os.path.join(REPOSITORY_DIR, repository.name)
            output = subprocess.check_output(
                ["git", "log", "--pretty=format:'%H'", "-n 1"],
                cwd=path)
            logger.debug(u"%s: %s" % (_('Revision is'), output))
            logger.info('<<<')
            last_sync_mark = open(os.path.join(path, 'lastSync.txt'), 'w+')
            last_sync_mark.write(output)
            last_sync_mark.close()

    except CommandError:
        pass
