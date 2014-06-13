from rest_framework import serializers
from repository.models import Repository


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ('name', 'note', 'enable_sync')

    def restore_object(self, attrs, instance=None):

        if instance:
            # Update existing instance
            # TODO

            return instance

        # Create new instance
        return Repository(**attrs)
