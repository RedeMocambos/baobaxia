from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from django.db.models import get_model
from mocambola.models import MocambolaUser


class MocambolaUserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = MocambolaUser
        fields = ('username', 'first_name', 'last_name', 'email', 'password', \
                      'is_staff', 'is_active', 'is_superuser', 'last_login', 'date_joined')

    def restore_object(self, attrs, instance=None):
        """
        Create or update a new MocambolaUser instance, given a dictionary
        of deserialized field values.

        Note that if we don't define this method, then deserializing
        data will simply return a dictionary of items.
        """
        if instance:
            # Update existing instance
            instance.username = attrs.get('username', instance.username)
            instance.first_name = attrs.get('first_name', instance.first_name)
            instance.last_name = attrs.get('last_name', instance.last_name)
            instance.email = attrs.get('email', instance.email)
            instance.password = attrs.get('password', instance.password)
            instance.is_staff = attrs.get('is_staff', instance.is_staff)
            instance.is_active = attrs.get('is_active', instance.is_active)
            instance.is_superuser = attrs.get('is_superuser', instance.is_superuser)
            instance.last_login = attrs.get('last_login', instance.last_login)
            instance.date_joined = attrs.get('date_joined', instance.date_joined)

            return instance

        # Create new instance
        return MocambolaUser(**attrs)
    
    def getJSON(self):
        return JSONRenderer().render(self.data)
