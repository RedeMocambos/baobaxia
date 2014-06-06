# -*- coding: utf-8 -*-

import re
import os
import subprocess
from subprocess import PIPE
import logging
import exceptions

from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from media.models import Media
from media.models import get_file_path
from repository.signals import filesync_done
from bbx.settings import DEFAULT_REPOSITORY

# REPOSITORY_CHOICE é uma tupla com repositórios dentro da pasta /annex
#REPOSITORY_CHOICES = [('mocambos', 'mocambos'), ('sarava', 'sarava')]
logger = logging.getLogger(__name__)
repository_dir = settings.REPOSITORY_DIR


# Connecting to Media signal
@receiver(post_save, sender=Media)
def git_media_post_save(instance, **kwargs):
    u"""Intercepta o sinal de *post_save* de objetos multimedia (*media*) e
    adiciona o objeto ao repositório."""
    from media.serializers import MediaSerializer
    logger.debug(instance.type)
    logger.debug(type(instance))
    git_annex_add(instance.get_file_name(), get_file_path(instance))
    serializer = MediaSerializer(instance)
    mediapath = get_file_path(instance)+'/'
    mediadata = os.path.splitext(instance.get_file_name())[0] + '.json'
    fout = open(mediapath + mediadata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    git_add(mediadata, mediapath)
    git_commit(instance.get_file_name(),
              instance.author.username,
              instance.author.email,
              get_file_path(instance))


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
                         'last_sync.txt'), 'r+')
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
        #  Este é um exemplo do comando para pegar os ultimos medias desde
        #  last_sync 
        #    cmd = 'git diff --pretty="format:" --name-only ' +
        #    last_sync + 'HEAD' \ + '| sort | uniq | grep json | grep -v
        #    mocambolas'

    cwd = os.path.join(repository_dir, current_repository.name)
    p1 = subprocess.Popen(
        ['git', 'diff', '--pretty=format:', '--name-only', 'HEAD', last_sync],
        cwd=cwd, stdout=PIPE
    )
    p2 = subprocess.Popen(["sort"], stdin=p1.stdout, stdout=PIPE)
    p3 = subprocess.Popen(["uniq"], stdin=p2.stdout, stdout=PIPE)
    p4 = subprocess.Popen(["grep", "json"], stdin=p3.stdout, stdout=PIPE)
    p5 = subprocess.Popen(["grep", "-v", "mocambola"],
                          stdin=p4.stdout, stdout=PIPE)
    output, error = p5.communicate()
    return output


def _get_available_folders(path):
    u"""Retorna a lista das pastas/repositórios"""
    folder_list = [(name, name) for name in os.listdir(path)
                  if os.path.isdir(os.path.join(path, name))]
    return folder_list


def git_add(file_name, repository_path):
    u"""Adiciona um arquivo no repositório."""
    logger.info('git add ' + file_name)
    cmd = 'git add ' + file_name
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_commit(file_title, author_name, author_email, repository_path):
    u"""Executa o *commit* no repositório impostando os dados do author."""
    logger.info('git commit --author="' + author_name + ' <' + author_email +
                '>" -m "' + file_title + '"')
    cmd = ('git commit --author="' + author_name + ' <' + author_email +
           '>" -m "' + file_title + '"')
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_push(repository_path):
    u"""Executa o *push* do repositório, atualizando o repositório de origem."""
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


def git_annex_get(repository_path):
    u"""Baixa os conteudos binarios desde o repositório remoto."""
    # TODO: Next release with possibility to choice what to get
    logger.info('git annex get .')
    cmd = 'git annex get .'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_annex_sync(repository_path):
    u"""Sincroniza o repositório com os outros clones remotos."""
    # TODO: Next release with possibility to choice what to get
    logger.info('git annex sync')
    cmd = 'git annex sync'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    pipe.wait()


def git_annex_version():
    v = re.search('(\d{1})\.(\d{8})',
                  subprocess.Popen('git annex version',
                                   shell=True,
                                   stdout=subprocess.PIPE).stdout.read())
    return v.group()


def git_annex_status(repository_path):
    u"""View all mucuas in a given repository"""
    logger.info('git annex info/status')

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

