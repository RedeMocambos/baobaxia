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

from media.models import Media, get_media_size
from tag.models import Tag
from repository.models import get_latest_media, get_default_repository, Repository
from repository.models import git_annex_list_tags, git_annex_add_tag
from repository.models import git_annex_remove_tag

from bbx.settings import REPOSITORY_DIR
from bbx.utils import dumpclean

logger = logging.getLogger(__name__)

class MediaFileSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True,
                                        slug_field='name',
                                        read_only=True)
    origin = serializers.SlugRelatedField(many=False, slug_field='description')
    repository = serializers.SlugRelatedField(many=False, slug_field='name')
    author = serializers.SlugRelatedField(many=False, slug_field='username')
    
    class Meta:
        model = Media
        fields = ('date', 'published_date', 'uuid', 'name', 'note', 'author', 'type',
                  'format', 'license', 'media_file', 'url', 'origin',
                  'repository', 'last_modified')
        depth = 1

    def getJSON(self):
        return JSONRenderer().render(self.data)


class MediaSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True,
                                        slug_field='name',
                                        read_only=True)
    origin = serializers.SlugRelatedField(many=False, slug_field='description')
    repository = serializers.SlugRelatedField(many=False, slug_field='name')
    author = serializers.SlugRelatedField(many=False, slug_field='username')
    size = serializers.SerializerMethodField('get_size')

    def get_size(self, media):
        return get_media_size(media)
    
    class Meta:
        model = Media
        fields = ('date', 'published_date', 'uuid', 'name', 'note', 'author', 'type',
                  'format', 'license', 'media_file', 'url', 'origin',
                  'repository', 'is_local', 'is_requested', 'num_copies',
                  'tags', 'last_modified', 'size')
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
            if field_name == 'media_file':
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
            instance.date = attrs.get('published_date', instance.published_date)
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
            instance.is_local = attrs.get('is_local', instance.is_local)
            instance.is_requested = attrs.get('is_requested', instance.is_requested)
#            instance.request_code = attrs.get('request_code', instance.request_code)
            instance.num_copies = attrs.get('num_copies', instance.num_copies)
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
    #logger.debug(u"%s \n %s" % (_('List of media found in repository..'), get_latest_media(repository)))
    try:
        for serialized_media in get_latest_media(repository):
            logger.info(u"%s: %s" % (_('Serialized Media'), serialized_media))
            media_json_file_path = os.path.join(REPOSITORY_DIR,
                                                repository.name,
                                                serialized_media)
            if os.path.isfile(media_json_file_path):
                with  open(media_json_file_path) as media_json_file:
		    try:
                        data = JSONParser().parse(media_json_file)
                    except:
                        print u"Problem parsing JSON: " + media_json_file.read()
                        continue

                try:
                    media = Media.objects.get(uuid=data["uuid"])
                    serializer = MediaSerializer(media, data=data, partial=True)
                    print serializer.is_valid()
                    print serializer.errors
                    serializer.object.save(is_syncing=True)
                    logger.info(u"%s" % _('This media already exist. Updated.'))
                except Media.DoesNotExist:
                    serializer = MediaSerializer(data=data)
                    print serializer.is_valid()
                    print serializer.errors
                    serializer.object.save(is_syncing=True)
                    media = serializer.object
                    logger.info(u"%s" % _('New media created'))

                # Synchronize/update tags.  
                #
                # 1) Add all tags found in the git-annex metadata and not
                # already present on the media.
                # 2) If tags from other mucuas have been deleted (are missing in
                # the git_annex metadata tags), remove them from this media.
                tags_on_media = set(git_annex_list_tags(media))
                existing_tags = set((t.namespace, t.name) for t in media.tags.all())
                # Add new tags to media
                for t in tags_on_media - existing_tags:
                    # Add tag - search for existing, if none found create new tag.
                    namespace, name = t
                    try: 
                        tag = Tag.objects.get(name=unicode(name),
                                              namespace=unicode(namespace))
                    except Tag.DoesNotExist:
                        tag = Tag(name=name, namespace=namespace)
                        tag.save()
                    media.tags.add(tag)

                # Remove tags that were removed on remote media
                for t in existing_tags - tags_on_media:
                    namespace, name = t 
                    tag = Tag.objects.get(name=name, namespace=namespace)
                    media.tags.remove(tag) 
             

    except CommandError:
        pass

def recriar_media_do_repositorio(repository=get_default_repository().name):
    """Recria os midias no Django a partir dos medias serializados em JSON."""
    try:
        repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return None

    logger.info(u">>> %s" % _('DESERIALIZING'))
    logger.info(u"%s: %s" % (_('Repository'),  repository))
    #logger.debug(u"%s \n %s" % (_('List of media found in repository..'), get_latest_media(repository)))                                                                                                                                                                                                                                                                                                                                                                                   

    from glob import glob
    caminho = os.path.join(REPOSITORY_DIR,repository.name)
    result = [y for x in os.walk(caminho) for y in glob(os.path.join(x[0], '*.json'))]

    result = [ x for x in result if "mocambolas" not in x ]
    logger.info(u"%s: %s" % (_('Numero'),  len(result)))
#    logger.info(u"%s: %s" % (_('JSONS'),  result))                                                                                                                                                                                                                                                                                                                                                                                                                                         

    try:
        for serialized_media in result:
            logger.info(u"%s: %s" % (_('Serialized Media'), serialized_media))
            media_json_file_path = os.path.join(REPOSITORY_DIR,
                                                repository.name,
                                                serialized_media)
            if os.path.isfile(media_json_file_path):
                with  open(media_json_file_path) as media_json_file:
                    try:
                        data = JSONParser().parse(media_json_file)
                    except:
                        print u"Problem parsing JSON: " + media_json_file.read()
                        continue

                try:
                    media = Media.objects.get(uuid=data["uuid"])
                    serializer = MediaSerializer(media, data=data, partial=True)
                    print serializer.is_valid()
                    print serializer.errors
                    serializer.object.save(is_syncing=True)
                    logger.info(u"%s" % _('This media already exist. Updated.'))
                except Media.DoesNotExist:
                    serializer = MediaSerializer(data=data)
                    print serializer.is_valid()
                    print serializer.errors
                    serializer.object.save(is_syncing=True)
                    media = serializer.object
                    logger.info(u"%s" % _('New media created'))

                # Synchronize/update tags.                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                #                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                # 1) Add all tags found in the git-annex metadata and not                                                                                                                                                                                                                                                                                                                                                                                                                   
                # already present on the media.                                                                                                                                                                                                                                                                                                                                                                                                                                             
                # 2) If tags from other mucuas have been deleted (are missing in                                                                                                                                                                                                                                                                                                                                                                                                            
                # the git_annex metadata tags), remove them from this media.                                                                                                                                                                                                                                                                                                                                                                                                                
                tags_on_media = set(git_annex_list_tags(media))
                existing_tags = set((t.namespace, t.name) for t in media.tags.all())
                # Add new tags to media                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                for t in tags_on_media - existing_tags:
                    # Add tag - search for existing, if none found create new tag.                                                                                                                                                                                                                                                                                                                                                                                                          
                    namespace, name = t
                    try:
                        tag = Tag.objects.get(name=unicode(name),
                                              namespace=unicode(namespace))
                    except Tag.DoesNotExist:
                        tag = Tag(name=name, namespace=namespace)
                        tag.save()
                    media.tags.add(tag)

                # Remove tags that were removed on remote media                                                                                                                                                                                                                                                                                                                                                                                                                             
                for t in existing_tags - tags_on_media:
                    namespace, name = t
                    tag = Tag.objects.get(name=name, namespace=namespace)
                    media.tags.remove(tag)


    except CommandError:
        pass

