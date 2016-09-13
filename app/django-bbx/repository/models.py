# -*- coding: utf-8 -*-

import re
import os
import json
import subprocess

from subprocess import PIPE
import logging
import exceptions

from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from media.models import get_file_path, Media

from repository.signals import filesync_done
from bbx.settings import DEFAULT_REPOSITORY
from bbx.utils import logger


# REPOSITORY_CHOICE é uma tupla com repositórios dentro da pasta /annex
#REPOSITORY_CHOICES = [('mocambos', 'mocambos'), ('sarava', 'sarava')]
#logger = logging.getLogger(__name__)
repository_dir = settings.REPOSITORY_DIR


# Connecting to Media signal
@receiver(post_save, sender=Media)
def git_media_post_save(instance, **kwargs):
    u"""Intercepta o sinal de *post_save* de objetos multimedia (*media*) e
    adiciona o objeto ao repositório."""
    if not instance.is_syncing:
        from media.serializers import MediaFileSerializer
        git_annex_add(instance.get_file_name(), get_file_path(instance))
        serializer = MediaFileSerializer(instance)
        mediapath = get_file_path(instance) + '/'
        mediadata = os.path.splitext(instance.get_file_name())[0] + '.json'
        fout = open(mediapath + mediadata, 'w')
        fout.write(str(serializer.getJSON()))
        fout.close()

        git_add(mediadata, mediapath)

        from mucua.models import get_default_mucua
        from media.views import add_and_synchronize_tags
        tags = [t.name for t in instance.tags.all()]
        add_and_synchronize_tags(instance, tags, get_default_mucua())

        git_commit(instance.get_file_name(),
                   instance.author.username,
                   instance.author.email,
                   get_file_path(instance),
                   os.path.join(mediapath, mediadata))


# Connecting to Media signal
@receiver(pre_delete, sender=Media)
def git_media_post_delete(instance, **kwargs):
    u"""Intercepta o sinal de *pre_delete* de objetos multimedia (*media*) e
    remove o objeto do banco e do repositório."""
    mediapath = get_file_path(instance)+'/'
    mediadata = os.path.splitext(instance.get_file_name())[0] + '.json'
    if os.path.isfile(os.path.join(mediapath, mediadata)): 
        git_annex_drop(instance)    
        git_rm(mediadata, mediapath)
    if os.path.isfile(os.path.join(mediapath, instance.get_file_name())):
        git_rm(instance.get_file_name(), mediapath)
        git_commit(instance.get_file_name(),
                   instance.author.username,
                   instance.author.email,
                   get_file_path(instance),
                   instance.get_repository())



def get_default_repository():
    return Repository.objects.get(name=DEFAULT_REPOSITORY)


def get_available_repositories():
    return Repository.objects.all()


def get_latest_media(repository=DEFAULT_REPOSITORY):
    u"""Retorna uma lista de caminhos dos novos medias no repositório,
    desde a ultima sincronização (last_sync)."""
    try:
        current_repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return []
    try:
        last_sync_mark = open(
            os.path.join(repository_dir, current_repository.name,
                         'lastSync.txt'), 'r+')
        last_sync = last_sync_mark.readline()
        last_sync = last_sync.replace("'", "")
        print "Alterações a partir do commit: " + last_sync
    except IOError:
        cwd = os.path.join(repository_dir, current_repository.name)
        p1 = subprocess.Popen(['git', 'rev-list', 'HEAD'],
                              cwd=cwd, stdout=PIPE)
        p2 = subprocess.Popen(['tail', '-n 1'],
                              stdin=p1.stdout, stdout=PIPE)
        output, error = p2.communicate()
        last_sync = output.rstrip()
        #  Este é um exemplo do comando para pegar os ultimos medias desde
        #  last_sync
        #    cmd = 'git diff --pretty="format:" --name-only ' +
        #    last_sync + 'HEAD' \ + '| sort | uniq | grep json | grep -v
        #    mocambolas'

    cwd = os.path.join(repository_dir, current_repository.name)
    p1 = subprocess.Popen(
        ['git', 'log', '--diff-filter=AM', '--pretty=format:', '--name-only', 
         last_sync + '..HEAD'], cwd=cwd, stdout=PIPE
    )
    p2 = subprocess.Popen(["sort"], stdin=p1.stdout, stdout=PIPE)
    p3 = subprocess.Popen(["uniq"], stdin=p2.stdout, stdout=PIPE)
    p4 = subprocess.Popen(["grep", "json"], stdin=p3.stdout, stdout=PIPE)
    p5 = subprocess.Popen(["grep", "-v", "mocambola"],
                          stdin=p4.stdout, stdout=PIPE)
    output, error = p5.communicate()
    updated = [line.strip('\n') for line in output.splitlines()]
    logger.info("Updated:\n%s", updated)
    deleted = [line.strip('\n') for line in get_deleted_media()]
    logger.info("Deleted:\n%s", deleted)
    return list(set(updated) - set(deleted))


def get_deleted_media(repository=DEFAULT_REPOSITORY):
    u"""Retorna uma lista de caminhos dos medias removidos do repositório,
    desde a ultima sincronização (last_sync)."""
    try:
        current_repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return []
    try:
        last_sync_mark = open(
            os.path.join(repository_dir, current_repository.name,
                         'lastSync.txt'), 'r+')
        last_sync = last_sync_mark.readline()
        last_sync = last_sync.replace("'", "")
    except IOError:
        cwd = os.path.join(repository_dir, current_repository.name)
        p1 = subprocess.Popen(['git', 'rev-list', 'HEAD'],
                              cwd=cwd, stdout=PIPE)
        p2 = subprocess.Popen(['tail', '-n 1'],
                              stdin=p1.stdout, stdout=PIPE)
        output, error = p2.communicate()
        last_sync = output.rstrip()
        #  Este é um exemplo do comando para pegar os ultimos medias
        #  deletados desde last_sync 
        #  git log --diff-filter=D --name-only
        #  d703a3dfa2c7ca7c7d2e318833bf935..HEAD | grep json | sort | uniq |
        #  grep -v mocambolas


    cwd = os.path.join(repository_dir, current_repository.name)
    p1 = subprocess.Popen(
        ['git', 'log', '--diff-filter=D', '--name-only', last_sync+'..HEAD'],
        cwd=cwd, stdout=PIPE
    )
    p2 = subprocess.Popen(["sort"], stdin=p1.stdout, stdout=PIPE)
    p3 = subprocess.Popen(["uniq"], stdin=p2.stdout, stdout=PIPE)
    p4 = subprocess.Popen(["grep", "json"], stdin=p3.stdout, stdout=PIPE)
    p5 = subprocess.Popen(["grep", "-v", "mocambola"],
                          stdin=p4.stdout, stdout=PIPE)
    output, error = p5.communicate()
    return [line.strip('\n') for line in output.splitlines()]

def _get_available_folders(path):
    u"""Retorna a lista das pastas/repositórios"""
    folder_list = [(name, name) for name in os.listdir(path)
                  if os.path.isdir(os.path.join(path, name))]
    return folder_list

def git_ls_remote(remote, repository_path):
    u"""Verifica se um remote esta disponivel."""
    logger.info('git ls-remote ' + remote)
    cmd = 'git ls-remote ' + remote
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    output = pipe.poll()
    return pipe.returncode

def git_remote_get_list(repository=DEFAULT_REPOSITORY):
    """
    Returns the list of connected mucua (git remote)
    
    """
    try:
        current_repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return []

    cmd = 'git remote -v'
    pipe = subprocess.Popen(cmd, shell=True, 
                            cwd=os.path.join(repository_dir, 
                                             current_repository.name), 
                            stdout=subprocess.PIPE)
    output, error = pipe.communicate()

    mucuas = []
    # Match repositories.
    if output:
        for line in output.splitlines():
            mucuas.append(line.split(None, 1)[0])
    return list(set(mucuas))
   

def git_remote_add(mucua_uuid, mucua_uri_backend, repository_path):
    u"""Adiciona um remote ao repositorio."""
    logger.info('git remote add ' + mucua_uuid + ' ' + mucua_uri_backend)
    cmd = 'git remote add ' + mucua_uuid + ' ' + mucua_uri_backend
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()

def git_remote_remove(mucua_uuid, repository_path):
    u"""Remove o remote do repositorio."""
    logger.info('git remote rm ' + mucua_uuid)
    cmd = 'git remote rm ' + mucua_uuid
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()

def git_add(file_name, repository_path):
    u"""Adiciona um arquivo no repositório."""
    logger.info('git add ' + file_name)
    cmd = 'git add ' + file_name
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()

def git_rm(file_name, repository_path):
    u"""Adiciona um arquivo no repositório."""
    logger.info('git rm ' + file_name)
    cmd = 'git rm -f ' + file_name
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()

def git_commit(file_title, author_name, author_email, repository_path, file_path):
    u"""Executa o *commit* no repositório impostando os dados do author."""
    logger.info('git commit --author="' + author_name + ' <' + author_email +
                '>" -m "' + file_title + '"')
    cmd = ('git commit --author="' + author_name + ' <' + author_email +
           '>" -m "' + file_title + '" -- ' + file_path)
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_push(repository_path):
    u"""Executa o *push* do repositório; atualizar o repositório de origem."""
    logger.info('git push ')
    cmd = 'git push '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_pull(repository_path):
    u"""Executa o *pull* do repositório, atualizando o repositório local."""
    logger.info('git pull ')
    cmd = 'git pull '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_get_SHA(repository_path):
    u"""Resgata o codigo identificativo (SHA) da ultima revisao do repositório,
    retorna o codigo."""
    logger.info('git rev-parse HEAD')
    cmd = 'git rev-parse HEAD'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    output, error = pipe.communicate()
    logger.debug('>>> Revision is: ' + output)
    return output


def git_annex_add(file_name, repository_path):
    u"""Adiciona um arquivo no repositório *git-annex*."""
    logger.info('git annex add ' + file_name)
    cmd = 'git annex add ' + file_name
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_annex_merge(repository_path):
    u"""Executa o *merge* do repositório, reunindo eventuais
    diferencias entre o repositório local e remoto."""
    logger.info('git annex merge ')
    cmd = 'git annex merge '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_annex_copy_to(repository_path):
    u"""Envia os conteudos binarios para o repositório remoto."""
    # TODO: Next release with dynamic "origin"
    logger.info('git annex copy --fast --to origin ')
    cmd = 'git annex copy --fast --to origin'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()

# @afazeres.task
# def git_annex_get(repository_path, media_path):
#     u"""
#     Baixa os conteudos binarios desde o repositório remoto.

#     Retorna o output do git annex get.    
#     """
#     # TODO: Next release with possibility to choice what to get
#     cmd = 'git annex get ' + media_path
#     logger.info(cmd)
#     pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
#     output, error = pipe.communicate()
#     return output


def git_annex_where_is(media):
    u"""Mostra quais mucuas tem copia do media."""
    cmd = 'git annex whereis ' + media.get_file_name() + ' --json'
    pipe = subprocess.Popen(cmd, shell=True, cwd=get_file_path(media), stdout=subprocess.PIPE)
    output, error = pipe.communicate()
    return output

def git_annex_drop(media):
    u"""Mostra quais mucuas tem copia do media."""
    cmd = 'git annex drop --force ' + os.path.basename(media.media_file.name) 
    logger.debug('Dropping filepath: ' + get_file_path(media) + media.get_file_name())
    pipe = subprocess.Popen(cmd, shell=True, cwd=get_file_path(media), stdout=subprocess.PIPE)
    output, error = pipe.communicate()
    logger.debug(error)
    logger.info(output)
    return output


def git_annex_metadata(file_name, repository_path):
    u"""Visualiza os metadatas do arquivo."""
    logger.info('git annex metadata ' + file_name + ' --json')
    cmd = 'git annex metadata ' + file_name + ' --json'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                            stdout=subprocess.PIPE)
    output, error = pipe.communicate()
    return output


def git_annex_metadata_add(file_name, repository_path, key, value):
    u"""Adiciona um metadata ao arquivo."""
    cmd = 'git annex metadata ' + file_name + ' -s ' + key + '+='+ "'"+ value +"'"
    logger.info('Adding metadata with: ' + cmd)
    pipe = subprocess.Popen(cmd.encode('UTF-8'), shell=True, cwd=repository_path)
    pipe.wait()

def git_annex_metadata_del(file_name, repository_path, key, value):
    u"""Remove um metadata do arquivo."""
    cmd = 'git annex metadata ' + file_name + ' -s ' + key + '-=' + "'"+ value +"'"
    logger.info('Removing metadata with: ' + cmd)
    pipe = subprocess.Popen(cmd.encode('UTF-8'), shell=True, cwd=repository_path)
    pipe.wait()

                            
def git_annex_list_tags(media):
    u"""Enumerar as etiquetas do media."""
    metadata = git_annex_metadata(media.get_file_name(), get_file_path(media))
    try:
        metadata = json.loads(metadata)
    except ValueError:
        # Sometimes, the JSON metadata output on non-present media files is 
        # malformed. Ignore these cases, but log.
        logger.debug(u'Malformed JSON found on media: {0}'.format(media))
        pass
    tags = []
    for item in metadata:
        if item.endswith('-tag'):
            for tag in metadata[item]:
                tags.append((item, tag))
    return tags


def git_annex_add_tag(media, namespace, tag):
    u"""Adicionar uma etiqueta ao media."""
    if tag.isspace() or not tag:
        raise RuntimeError("Attempt to set empty tag!")
    git_annex_metadata_add(media.get_file_name(), get_file_path(media),
                           namespace, tag)


def git_annex_remove_tag(media, namespace, tag):
    u"""Apagar uma etiqueta do media."""
    git_annex_metadata_del(media.get_file_name(), get_file_path(media),
                           namespace, tag)


def git_annex_group_add(repository_path, mucua_uuid, group):
    u"""Adiciona a Mucua no grupo."""
    cmd = 'git annex group ' + mucua_uuid + ' ' + group
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                            stdout=subprocess.PIPE)
    output, error = pipe.communicate()
    logger.debug("E > %s", error)
    logger.debug("O > %s", output)
    return output


def git_annex_group_del(repository_path, mucua, group):
    u"""Remove a Mucua do grupo."""
    cmd = 'git annex ungroup ' + mucua + ' ' + group
    logger.debug("Command: " + cmd)
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                            stdout=subprocess.PIPE)
    output, error = pipe.communicate()
    logger.debug(error)
    logger.debug(output)
    return output


def git_annex_group_list(repository_path, mucua_uuid=None):
    u"""Lista todos os grupos ou de uma dada mucua"""
    if mucua_uuid == None:
        from mucua.models import Mucua
        mucuas = Mucua.objects.all()
        group_set = set()
        for mucua in mucuas:
            cmd = 'git annex group ' + mucua.get_description()
            logger.debug("Command: " + cmd)
            pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                                    stdout=subprocess.PIPE)
            output, error = pipe.communicate()
            logger.debug(error)
            logger.debug(output)
            if output != '':
                for group in output.split():
                    group_set.add(group)
        return list(group_set)
    else:
#        from mucua.models import Mucua
#        mucua = Mucua.objects.get(uuid=mucua_uuid)
        cmd = 'git annex group ' + mucua_uuid
        logger.debug("Command: " + cmd)
        pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                                stdout=subprocess.PIPE)
        output, error = pipe.communicate()
        logger.debug('E > %s', error)
        logger.debug('O > %s', output)
        if output != '':
            return output.split()
        else:
            return []


def git_annex_sync(repository_path):
    u"""Sincroniza o repositório com os outros clones remotos."""
    logger.info('git annex sync')
    cmd = 'git annex sync'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_annex_version():
    v = re.search('(\d{1})\.(\d{8})',
                  subprocess.Popen('git annex version',
                                   shell=True,
                                   stdout=subprocess.PIPE).stdout.read())
#    return v.group()
    
    version = 5.20150420
    return version

def git_annex_status(repository_path):
    u"""View all mucuas in a given repository"""

    # a partir da versao 5
    if (float(git_annex_version()) <= 5):
        cmd = 'git annex status --json'
    else:
        cmd = 'git annex info --json'

    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path,
                            stdout=subprocess.PIPE)
    return pipe.stdout.read()


def run_scheduled_jobs():
    u"""Executa as operacoes programadas em todos os repositórios. """
    repositories = Repository.objects.all()
    for rep in repositories:
        if rep.enable_sync:
            # TODO: Manage time of syncing
            # if rep.syncStartTime >= datetime.datetime.now():
            rep.sync_repository()


class Repository(models.Model):
    u"""
    Classe de implementacao do modelo de repositório *git-annex*.

    Atributos
    name: nome do repositório (campo preenchido por
    *_getAvailableFolders()*)
    note: anotações livres
    enableSync = flag booleano para abilitar ou disabilitar a sincronizacao
    """

    name = models.CharField(
        _('name'),
        help_text=_('Repository name taken from available repositories'),
        max_length=60,
        choices=_get_available_folders(repository_dir))
    note = models.TextField(
        _('notes'),
        help_text=_('Note.. use as you wish!'),
        max_length=300, blank=True)

    enable_sync = models.BooleanField(
        _('synchronize'),
        help_text=_('Tick here to enable'
                    'syncronization of this repository'),)

    class Meta:
        ordering = ('name',)
        verbose_name = _('repository')
        verbose_name_plural = _('repositories')

    def __unicode__(self):
        return self.name

    def get_name(self):
        u"""Retorna o nome do repositório."""
        return str(self.name)

    def get_path(self):
        u"""Retorna o caminho no disco (path) do repositório."""
        return os.path.join(repository_dir, self.get_name())

    def create_repository(self):
        u"""Cria e inicializa o repositório."""
        #TODO: Implement this!
        #_createRepository(self.name, self.getPath())
        pass

    def clone_repository(self):
        u"""Clona e inicializa o repositório."""
        #TODO: Implement this!
        #_cloneRepository(self.getPath, self.name)
        pass

    def sync_repository(self):
        u"""Sincroniza o repositório com sua origem."""
        git_annex_sync(self.get_path())

        filesync_done.send(sender=self, name=self.get_name(),
                           repositoryDir=self.get_path())

    def save(self, *args, **kwargs):
        super(Repository, self).save(*args, **kwargs)


class GitAnnexCommandError(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args


class RepositoryDoesNotExists(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args


def remove_deleted_media(repository=DEFAULT_REPOSITORY):
    """Remove os midias no Django a partir do log do git."""
    try:
        repository = Repository.objects.get(
            name=repository)
    except Repository.DoesNotExist:
        return None

    logger.info(u">>> %s" % _('CLEANING'))
    logger.info(u"%s: %s" % (_('Repository'),  repository))

    from media.models import Media

    try:
        for deleted_media in get_deleted_media(repository):
            logger.info(u"%s: %s" % (_('Deleting media'), deleted_media))
            
            try:
                fingerprint = os.path.join(repository_dir, repository.get_name(),
                                           os.path.splitext(deleted_media)[0])
                logger.info(u"%s: %s" % (_('Fingerprint'), fingerprint))
                media = Media.objects.filter(media_file__startswith=fingerprint)
                media[0].delete()
                logger.info(u"%s" % _('Media deleted.'))
                
            except (Media.DoesNotExist, IndexError):
                logger.info(u"%s" % _('Media doesn\'t exist'))

    except Media.DoesNotExist:
        logger.info(u"%s" % _('Delete problem'))

