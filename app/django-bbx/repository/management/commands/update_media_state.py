import shutil
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from media.models import Media, MediaDoesNotExist
from tag.models import Tag
from bbx.utils import logger
from repository.models import git_annex_list_tags

"""
Definicoes do comando para atualizar o estado dos medias
"""

class Command(BaseCommand):
    """Atualiza o estado dos media"""
    help = 'Atualiza o estado dos media desde os numero de dias passado (por default 7 dias)'

    def handle(self, *args, **options):
        if len(args) == 0:
            since = 7
        else:
            since = int(args[0])
        some_day_last_week = timezone.now().date() - timedelta(days=since)
        monday_of_last_week = some_day_last_week - timedelta(days=(some_day_last_week.isocalendar()[2] - 1))
        monday_of_this_week = monday_of_last_week + timedelta(days=since)
        medias = Media.objects.filter(date__gte=monday_of_last_week, date__lt=monday_of_this_week)
        
        for media in medias:
            try:

                # Synchronize/update tags.  
                #
                # 1) Add all tags found in the git-annex metadata and not
                # already present on the media.
                # 2) If tags from other mucuas have been deleted (are missing in
                # the git_annex metadata tags), remove them from this media.
                tags_on_media = set(git_annex_list_tags(media))
                existing_tags = set((t.namespace, t.name) for t in media.tags.all())
                # Add new tags to media
                for t in tags_on_media - existing_tags:
                    # Add tag - search for existing, if none found create new tag.
                    namespace, name = t
                    try: 
                        tag = Tag.objects.get(name=unicode(name),
                                              namespace=unicode(namespace))
                    except Tag.DoesNotExist:
                        tag = Tag(name=name, namespace=namespace)
                        tag.save()
                    media.tags.add(tag)

                # Remove tags that were removed on remote media
                for t in existing_tags - tags_on_media:
                    namespace, name = t 
                    tag = Tag.objects.get(name=name, namespace=namespace)
                    media.tags.remove(tag) 

                media.save(is_syncing=True)

            except OSError, e:
                logger.debug('Requested media not found: ' + media.name)        
        
