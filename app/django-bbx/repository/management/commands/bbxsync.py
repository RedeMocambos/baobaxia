# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from media.serializers import create_objects_from_files
from repository.models import Repository
from repository.models import remove_deleted_media
from mucua.models import update_mucuas_list
from mocambola.models import create_user_from_files

"""
Definicoes do comando para sincronizar a mucua local.
"""


class Command(BaseCommand):
    u"""Sincroniza a mucua local, a partir dos metadados e configurações do
    repositório."""
    help = 'Create media objects from new serialized objects.'
    args = '[repository name] [repository name] ...'

    def handle(self, *args, **options):
        for repository in args:
            try:
                repository_instance = Repository.objects.get(name=repository)
            except Repository.DoesNotExist:
                return False

            repository_instance.sync_repository()
            update_mucuas_list(repository_instance)
            create_user_from_files(repository_instance)
            create_objects_from_files(repository_instance)
            remove_deleted_media(repository_instance)
