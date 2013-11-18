
# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.base import ModelBase
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from media.models import Media
from media.models import getFilePath

from django.db.models import get_model
from repository.signals import filesync_done

from django.utils.translation import ugettext_lazy as _
from bbx.settings import DEFAULT_REPOSITORY


import os
import datetime
import subprocess
import logging


"""
Modelos da aplicacao Django. 

Neste arquivo sao definidos os modelos de dados da aplicacao *gitannex*.
"""

# REPOSITORY_CHOICE é uma tupla com repositorios dentro da pasta /annex
REPOSITORY_CHOICES = [ ('mocambos', 'mocambos'), ('sarava', 'sarava') ]
logger = logging.getLogger(__name__)
repository_dir = settings.REPOSITORY_DIR


# Connecting to Media signal
@receiver(post_save, sender=Media)
def gitMediaPostSave(instance, **kwargs):
    """Intercepta o sinal de *post_save* de objetos multimedia (*media*) e adiciona o objeto ao repositorio."""
    from media.serializers import MediaSerializer
    logger.debug(instance.type)
    logger.debug(type(instance))
    gitAnnexAdd(instance.getFileName(), getFilePath(instance))
    serializer = MediaSerializer(instance)
    mediapath = getFilePath(instance)+'/'
    mediadata = instance.uuid + '.json'
    fout = open(mediapath + mediadata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    gitAdd(mediadata, mediapath)
    gitCommit(instance.getFileName(), instance.author.username, instance.author.email, getFilePath(instance))

def getDefaultRepository():
    return Repository.objects.get(name = DEFAULT_REPOSITORY)

def getAvaliableRepositories():
    return REPOSITORY_CHOICES

def _getAvailableFolders(path):
    """Procura as pastas que podem ser inicializada como repositorio, retorna a lista das pastas."""
    folderList = [( name , name ) for name in os.listdir(path) \
                      if os.path.isdir(os.path.join(path, name))]
    return folderList

def gitAdd(fileName, repoDir):
    """Adiciona um arquivo no repositorio."""
    logger.info('git add ' + fileName)
    cmd = 'git add '+ fileName
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitCommit(fileTitle, authorName, authorEmail, repoDir):
    """Executa o *commit* no repositorio impostando os dados do author."""
    logger.info('git commit --author="' + authorName + ' <' + authorEmail +'>" -m "' + fileTitle + '"')
    cmd = 'git commit --author="' + authorName + ' <' + authorEmail +'>" -m "' + fileTitle + '"'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitPush(repoDir):
    """Executa o *push* do repositorio, atualizando o repositorio de origem."""
    logger.info('git push ')
    cmd = 'git push '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitPull(repoDir):
    """Executa o *pull* do repositorio, atualizando o repositorio local."""
    logger.info('git pull ')
    cmd = 'git pull '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitGetSHA(repoDir):
    """Resgata o codigo identificativo (SHA) da ultima revisao do repositorio, retorna o codigo."""
    logger.info('git rev-parse HEAD')
    cmd = 'git rev-parse HEAD'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    output,error = pipe.communicate()
    logger.debug('>>> Revision is: ' + output)
    return output

def gitAnnexAdd(fileName, repoDir):
    """Adiciona um arquivo no repositorio *git-annex*."""
    logger.info('git annex add ' + fileName)
    cmd = 'git annex add ' + fileName
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitAnnexMerge(repoDir):
    """Executa o *merge* do repositorio, reunindo eventuais diferencias entre o repositorio local e remoto."""    
    logger.info('git annex merge ')
    cmd = 'git annex merge '
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitAnnexCopyTo(repoDir):
    """Envia os conteudos binarios para o repositorio remoto."""
    # TODO: Next release with dynamic "origin" 
    logger.info('git annex copy --fast --to origin ')
    cmd = 'git annex copy --fast --to origin'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitAnnexGet(repoDir):
    """Baixa os conteudos binarios desde o repositorio remoto."""
    # TODO: Next release with possibility to choice what to get 
    logger.info('git annex get .')
    cmd = 'git annex get .'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitAnnexSync(repoDir):
    """Sincroniza o repositorio com os outros clones remotos."""
    # TODO: Next release with possibility to choice what to get 
    logger.info('git annex sync')
    cmd = 'git annex sync'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    pipe.wait()

def gitAnnexStatus(repoDir):
    """View all mucuas in a given repository"""
    logger.info('git annex status')
    cmd = 'git annex status --json'
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir, stdout=subprocess.PIPE)
    return pipe.stdout.read()

def runScheduledJobs():
    """Executa as operacoes programadas em todos os repositorios. """
    allRep = Repository.objects.all()
    for rep in allRep:
        if rep.enableSync:
            # TODO: Manage time of syncing
            # if rep.syncStartTime >= datetime.datetime.now():
            rep.syncRepository()


class Repository(models.Model):
    """Classe de implementacao do modelo de repositorio *git-annex*.
    
    Atributos:
        name: nome do repositorio (campo preenchido por *_getAvailableFolders()*)
        note: Note.. use as you wish!
        enableSync = flag booleano para abilitar ou disabilitar a sincronizacao
    """

    name = models.CharField(_('name'), 
                            help_text=_('Repository name taken from available repositories'),
                            max_length=60,
                            choices=_getAvailableFolders(repository_dir))
    note = models.TextField(_('notes'),
                            help_text=_('Note.. use as you wish!'),
                            max_length=300, blank=True)

    enableSync = models.BooleanField(_('synchronize'),
                                     help_text=_('Tick here to enable'
                                                 'syncronization of this repository'),)

    class Meta:
        ordering = ('name',)
        verbose_name = _('repository')
        verbose_name_plural = _('repositories')

    def __unicode__(self):
        return self.name


    def getName(self):
        """Retorna o nome do repositorio."""
        return str(self.name)
    
    def getPath(self):
        """Retorna o caminho no disco (path) do repositorio."""
        return os.path.join(repository_dir, self.getName()) 

    def createRepository(self):
        """Cria e inicializa o repositorio."""
        _createRepository(self.name, self.getPath())
    
    def cloneRepository(self):
        """Clona e inicializa o repositorio."""
        _cloneRepository(self.getPath, self.name)

    def syncRepository(self):
        """Sincroniza o repositorio com sua origem."""
        gitAnnexSync(self.repositoryURLOrPath)

        filesync_done.send(sender=self, name=self.getName(), \
                               repositoryDir=self.getPath())

    def save(self, *args, **kwargs):
        super(Repository, self).save(*args, **kwargs)


