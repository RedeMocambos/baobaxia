from django.forms import widgets
from rest_framework import serializers
from media.models import Media, FORMAT_CHOICES, TYPE_CHOICES
from tag.models import Tag
#from mucua.models import Mucua
from tag.serializers import TagSerializer
from mucua.serializers import MucuaSerializer
#from repository.serializers import RepositorySerializer
from rest_framework.renderers import JSONRenderer

from django.db.models import get_model


class MediaSerializer(serializers.ModelSerializer):
    # com essas linhas, media puxa apenas referencia (nao objeto completo)
    # nao sei se mantemos assim ou se puxamos o relacionamento completo 
    tags = serializers.RelatedField(many = True)
    origin = serializers.RelatedField(many = False)
    repository = serializers.RelatedField(many = False)
#    author = serializers.RelatedField(many = False)

#    tags = TagSerializer(required=False)
#    origin = MucuaSerializer()

#    from repository.serializers import RepositorySerializer
#    repository = RepositorySerializer()
    
    class Meta:
        model = Media
        fields = ('date', 'uuid', 'name', 'note', 'author', 'type', 'format', 'license', 'mediafile', 'origin', 'repository')
#        depth = 1   # se comentar linhas de cima, ativar essa

    def restore_object(self, attrs, instance=None):
        """
        Create or update a new media instance, given a dictionary
        of deserialized field values.

        Note that if we don't define this method, then deserializing
        data will simply return a dictionary of items.
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
            instance.mediafile = attrs.get('mediafile', instance.mediafile)
            # tags
            # repository
            
            return instance

        # Create new instance
        return Media(**attrs)
    
    def getJSON(self):
        return JSONRenderer().render(self.data)
