# -*- coding: utf-8 -*-
from django.conf import settings
from django.contrib.auth.models import User, check_password
from mocambola.serializers import UserSerializer
from bbx.settings import MOCAMBOLA_DIR, REPOSITORY_DIR

from StringIO import StringIO
from rest_framework.parsers import JSONParser

from urlparse import urlparse
import os
import re

try:
    import json                 # Python 2.6
except ImportError:
    import simplejson as json   # Python 2.5

class FileBackend(object):
    """
    Authenticate against the serialized User object in repository
    """
    
    # TODO LOW: Limpar a arrumar melhor o codigo
    
    def authenticate(self, username=None, password=None):
        match = re.findall("(.*)@(.*)\.(.*)\.(.*)$", username)
        if match:
            current_mocambola, current_mucua, current_repository, term = match[0]            
        else:
            print "invalid address"
            return None
        
        # Get file from MOCAMBOLA_DIR
        mocambola_path = os.path.join(REPOSITORY_DIR, current_repository, current_mucua, MOCAMBOLA_DIR)
        for jmocambola in os.listdir(mocambola_path):
            print "jmocambola: ", jmocambola
            print "current_mocambola: ", current_mocambola
            
            if jmocambola == username + '.json':
                # Deserialize the customized User object
                mocambola_json_file = open(os.path.join(mocambola_path, jmocambola))
                data = JSONParser().parse(mocambola_json_file)
                u = User() 
                serializer = UserSerializer(u, data=data)
                print "serializer.errors: ", serializer.errors
                print "serializer.is_valid: ", serializer.is_valid()

                current_user = serializer.object
        
                print username , "==", current_user.username
                
                login_valid = (username == current_user.username)
                pwd_valid = check_password(password, current_user.password)
                
                print "current_user: ", current_user
                print "login_valid: ", login_valid
                print "pwd_valid: ", pwd_valid
                
                if login_valid and pwd_valid:
                    try:
                        user = User.objects.get(username=username)                
                    except User.DoesNotExist:
                        print "User.DoesNotExist"
                        # Create a new user. Note that we can set password
                        # to anything, because it won't be checked; the password
                        # from settings.py will.
                        user = User(username=username, password=current_user.password, \
                                        is_staff=current_user.is_staff, is_superuser=current_user.is_superuser)
                        user.save()
                    print "User:", user
                    return user
                else:
                    print "invalid username and/or password"
                    return None
                return True
            # fim do if
        # fim do for
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
