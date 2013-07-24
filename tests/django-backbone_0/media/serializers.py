from django.forms import widgets
from rest_framework import serializers
from media.models import Media, FORMAT_CHOICES, TYPE_CHOICES
from etiqueta.models import Etiqueta

class MediaSerializer(serializers.ModelSerializer):
    # com essas linhas, media puxa apenas referencia (nao objeto completo)
    # nao sei se mantemos assim ou se puxamos o relacionamento completo 
    tags = serializers.RelatedField(many = True)
    origin = serializers.RelatedField(many = False)
    repository = serializers.RelatedField(many = False)

    class Meta:
        model = Media
        fields = ('date', 'uuid', 'title', 'comment', 'type', 'format', 'license', 'mediafile', 'tags', 'origin', 'repository')
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
            instance.title = attrs.get('title', instance.title)
            instance.comment = attrs.get('comment', instance.comment)
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
