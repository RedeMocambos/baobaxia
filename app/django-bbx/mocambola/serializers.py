from rest_framework import serializers
from rest_framework.renderers import JSONRenderer

from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password',
                  'is_staff', 'is_active', 'is_superuser', 'last_login',
                  'date_joined')

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.password = validated_data.get('password', instance.password)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_superuser = validated_data.get('is_superuser',
                                                   instance.is_superuser)
        instance.last_login = validated_data.get('last_login', instance.last_login)
        instance.date_joined = validated_data.get('date_joined',
                                                  instance.date_joined)
        instance.save()
        return instance
    
    def create(self, validated_data):
        return User.objects.create(**validated_data)
        
    def getJSON(self):
        return JSONRenderer().render(self.data)
