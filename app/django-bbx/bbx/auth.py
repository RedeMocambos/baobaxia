# -*- coding: utf-8 -*-
import os
import re
import logging

from rest_framework.parsers import JSONParser

from django.contrib.auth.models import User, check_password
from django.utils.translation import ugettext_lazy as _

from mocambola.serializers import UserSerializer
from mucua.models import Mucua
from repository.models import Repository
from bbx.settings import MOCAMBOLA_DIR, REPOSITORY_DIR

logger = logging.getLogger(__name__)


class FileBackend(object):
    """
    Authenticate against the serialized User object in repository
    """

    # TODO LOW: Limpar a arrumar melhor o codigo

    def authenticate(self, username=None, password=None):
        match = re.findall("(.*)@(.*)\.(.*)\.(.*)$", username)
        if match:
            (current_mocambola, current_mucua, current_repository,
             term) = match[0]
            # verifica se mucua e repositorio sao validos
            try:
                current_mucua = Mucua.objects.get(description=current_mucua)
            except Mucua.DoesNotExist:
                return None
            try:
                current_repository = Repository.objects.get(
                    name=current_repository)
            except Repository.DoesNotExist:
                return None
        else:
            print "invalid address"
            return None
        # Get file from MOCAMBOLA_DIR
        mocambola_path = os.path.join(str(REPOSITORY_DIR),
                                      str(current_repository),
                                      str(current_mucua),
                                      MOCAMBOLA_DIR)

        for jmocambola in os.listdir(mocambola_path):

            if jmocambola == username + '.json':
                # Deserialize the customized User object
                mocambola_json_file = open(os.path.join(mocambola_path,
                                                        jmocambola))
                data = JSONParser().parse(mocambola_json_file)
                u = User()
                serializer = UserSerializer(u, data=data)
                if serializer.errors:
                    logger.debug(u"%s %s" % (_('Error deserialing'),
                                             serializer.errors))
                serializer.is_valid()

                current_user = serializer.object

                login_valid = (username == current_user.username)
                pwd_valid = check_password(password, current_user.password)

                if login_valid and pwd_valid:
                    logger.info(u"%s %s %s" % (_('User'),
                                               current_mocambola,
                                               _('logged in')))
                    try:
                        user = User.objects.get(username=username)
                    except User.DoesNotExist:
                        logger.debug(u"%s" % (
                            _('Exception caught, UserDoesNotExist')
                        ))
                        # Create a new user. Note that we can set password
                        # to anything, because it won't be checked; the
                        # password from settings.py will.
                        user = User(username=username,
                                    password=current_user.password,
                                    is_staff=current_user.is_staff,
                                    is_superuser=current_user.is_superuser)
                        user.save()
                    return user
                else:
                    logger.info(
                        u"%s %s %s" % (
                            _('User'), current_mocambola,
                            _('doesn\'t exist or password is wrong!')))
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
