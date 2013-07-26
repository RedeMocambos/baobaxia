from django.forms import widgets
from rest_framework import serializers
from etiqueta.models import Etiqueta

class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ('id', 'namespace', 'note', 'etiqueta')

    def restore_object(self, attrs, instance=None):
        
        if instance:
            # Update existing instance
            instance.id = attrs.get('id', instance.id)
            instance.namespace = attrs.get('namespace', instance.namespace)
            instance.note = attrs.get('namespace', instance.note)
            instance.etiqueta = attrs.get('etiqueta', instance.etiqueta)
            
            return instance

        # Create new instance
        return Etiqueta(**attrs)
