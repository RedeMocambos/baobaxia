from rest_framework import serializers
from tag.models import Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'namespace', 'note', 'name')

    def restore_object(self, attrs, instance=None):

        if instance:
            # Update existing instance
            instance.id = attrs.get('id', instance.id)
            instance.namespace = attrs.get('namespace', instance.namespace)
            instance.note = attrs.get('namespace', instance.note)
            instance.name = attrs.get('name', instance.name)

            return instance

        # Create new instance
        return Tag(**attrs)
