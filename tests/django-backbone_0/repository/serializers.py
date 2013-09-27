from django.forms import widgets
from rest_framework import serializers
from repository.models import Repository

class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ('uuid', 'note', 'repositoryName', 'repositoryURLOrPath', 'syncStartTime', 'enableSync', 'remoteRepositoryURLOrPath')

    def restore_object(self, attrs, instance=None):
        
        if instance:
            # Update existing instance
            # TODO
            
            return instance

        # Create new instance
        return Repository(**attrs)
