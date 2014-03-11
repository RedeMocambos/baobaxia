from django.forms import widgets
from rest_framework import serializers
from media.models import Media, FORMAT_CHOICES, TYPE_CHOICES
from repository.models import getLatestMedia, getDefaultRepository
from bbx.settings import REPOSITORY_DIR
from tag.models import Tag
from tag.serializers import TagSerializer
from mucua.serializers import MucuaSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from bbx.utils import dumpclean
from django.utils.translation import ugettext_lazy as _


from django.db.models import get_model
from django.core.management.base import CommandError
import os
import logging
import subprocess

logger = logging.getLogger(__name__)

class MediaSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, slug_field='name', read_only=True)
    origin = serializers.SlugRelatedField(many = False, slug_field='description')
    repository = serializers.SlugRelatedField(many = False, slug_field='name')
    author = serializers.SlugRelatedField(many = False, slug_field='username')
    
    class Meta:
        model = Media
        fields = ('date', 'uuid', 'name', 'note', 'author', 'type', \
                      'format', 'license', 'mediafile', 'origin', \
                      'repository', 'tags')
        depth = 1  

    def restore_object(self, attrs, instance=None):
        """
        Create or update a new media instance, given a dictionary
        of deserialized field values.

        Note that if we don't define this method, then deserializing
        data will simply return a dictionary of items.
        """
        if instance is not None:
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
            instance.mediafile = attrs.get('mediafile', instance.mediafile)
            instance.tags = attrs.get('tags', instance.tags)
            instance.repository = attrs.get('repository', instance.repository)
            return instance
        # Create new instance
        return Media(**attrs)

    def get_pk_field(self, model_field):
        return None

    def getJSON(self):
        return JSONRenderer().render(self.data)


def createObjectsFromFiles(repository = getDefaultRepository().name):
    """Recria os midias no Django a partir dos medias serializados em JSON."""
    logger.info(u">>> %s" % _('DESERIALIZING') )
    logger.info(u"%s: %s" % (_('Repository'),  repository) )
    print getLatestMedia(repository).splitlines()
    try:
        for serialized_media in getLatestMedia(repository).splitlines():
            logger.info(u"%s: %s" % (_('Serialized Media'), serialized_media)) 
            media_json_file_path = os.path.join(REPOSITORY_DIR, repository, serialized_media)
            media_json_file = open(media_json_file_path)
            data = JSONParser().parse(media_json_file)
            
            media = Media.objects.filter(uuid=data["uuid"])

            if not media:
                dumpclean(data)
                serializer = MediaSerializer(data=data)
                serializer.is_valid()
                print serializer.object.mediafile
                #logger.error(serializer.errors)
                serializer.object.save()
            else:
                logger.info(u"%s" % _('This media already exist') ) 

            # Atualiza o arquivo lastSyncMark
            path = os.path.join(REPOSITORY_DIR, repository)
            output = subprocess.check_output(["git", "log", "--pretty=format:'%H'", "-n 1"], cwd=path)
            logger.info(u"%s: %s" % (_('Revision is'), output ))
            logger.info('<<<')
            lastSyncMark = open(os.path.join(path, 'lastSync.txt'), 'w+' )
            lastSyncMark.write(output)
            lastSyncMark.close()
            
    except CommandError:
        pass

