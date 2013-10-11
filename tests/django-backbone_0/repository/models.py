# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.base import ModelBase
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

#from gitannex.signals import receiver_subclasses, filesync_done
from media.models import Media
from media.models import getFilePath
#from media.serializers import MediaSerializer

from django.db.models import get_model
from repository.signals import filesync_done

import os
import datetime
import subprocess
import logging

"""
Modelos da aplicacao Django. 

Neste arquivo sao definidos os modelos de dados da aplicacao *gitannex*.
"""

# REPOSITORY_CHOICE é uma tupla com repositorios dentro da pasta /annex
REPOSITORY_CHOICES = [ ('redemocambos', 'redemocambos'), ('sarava', 'sarava'), ('m0c4mb0s', 'm0c4mb0s') ]
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
    print serializer.getJSON()
#    gitAdd(instance.getFileName(), getFilePath(instance))
    mediapath = getFilePath(instance)+'/'
    mediadata = instance.uuid + '.json'
    fout = open(mediapath + mediadata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    gitAdd(mediadata, mediapath)
    gitCommit(instance.getFileName(), instance.author.username, instance.author.email, getFilePath(instance))

def _createRepository(repositoryName, remoteRepositoryURLOrPath):
    """Cria e inicializa um repositorio *git-annex*."""
    logger.info('git config --global user.name "admin"')
    cmd = 'git config --global user.name "admin"' 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()
    logger.info('git config --global user.email "admin@mocambos.net"')
    cmd = 'git config --global user.email "admin@mocambos.net"' 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()
    logger.info('git init')
    cmd = 'git init' 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()
    logger.info('git annex init ' + settings.PORTAL_NAME)
    cmd = 'git annex init ' + settings.PORTAL_NAME 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()
    # TODO: Manage repositories dinamically 
    logger.info('git remote add baoba ' + remoteRepositoryURLOrPath)
    cmd = 'git remote add baoba ' + remoteRepositoryURLOrPath 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()


def _cloneRepository(repositoryURLOrPath, repositoryName):
    """Clona e inicializa um repositorio *git-annex*."""
    cmd = 'git config --global user.name "admin"' 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir))
    pipe.wait()
    cmd = 'git config --global user.email "admin@mocambos.net"' 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir))
    pipe.wait()
    cmd = 'git clone ' + repositoryURLOrPath + repositoryName  
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir))
    pipe.wait()
    cmd = 'git annex init ' + settings.PORTAL_NAME 
    pipe = subprocess.Popen(cmd, shell=True, cwd=os.path.join(settings.MEDIA_ROOT, repository_dir, repositoryName))
    pipe.wait()

def _selectRepositoryByPath():
    # Controlla il path del file ed estrai il nome del Repository
    return

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

def gitStatus(repoDir):
    """Verifica o estado atual do repositorio"""
    # Dovrebbe restituire oltre allo status un flag per avviare o no il sync
    cmd = 'git status'

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
    pipe = subprocess.Popen(cmd, shell=True, cwd=repoDir)
    output,error = pipe.communicate()
    return output

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
        repositoryName: nome do repositorio (campo preenchido por *_getAvailableFolders()*)
        repositoryURLOrPath: apontador ao repositorio no disco ou em rede
        syncStartTime = orario de inicio da sincronizacao
        enableSync = flag booleano para abilitar ou disabilitar a sincronizacao
        remoteRepositoryURLOrPath = apontador ao repositorio de origem 
    """
    mucua = models.ManyToManyField('mucua.Mucua', related_name='repos', blank=True, null=True)
#    mucua = models.ManyToManyField('mucua.Mucua', symmetrical=True, related_name='repository')
    note = models.TextField(max_length=300, blank=True)
#    repositoryName = models.CharField(max_length=100, choices=REPOSITORY_CHOICES, default='redemocambos', unique=True)
    repositoryName = models.CharField(max_length=60, choices=_getAvailableFolders(repository_dir))
    syncStartTime = models.DateField()
    enableSync = models.BooleanField()
    remoteRepositoryURLOrPath = models.CharField(max_length=200)
    
    def getName(self):
        """Retorna o nome do repositorio."""
        return str(self.repositoryName)
    
    def getPath(self):
        """Retorna o caminho no disco (path) do repositorio."""
        return os.path.join(repository_dir, self.getName()) 

    def createRepository(self):
        """Cria e inicializa o repositorio."""
        _createRepository(self.repositoryName, self.remoteRepositoryURLOrPath)
    
    def cloneRepository(self):
        """Clona e inicializa o repositorio."""
        _cloneRepository(self.repositoryURLOrPath, self.repositoryName)

    def getPath(self):
        # TODO LOW: Juntar numa biblioteca
        return os.path.join(repository_dir, self.getName()) 
        
    def syncRepository(self):
        """Sincroniza o repositorio com sua origem."""
        gitAnnexSync(self.repositoryURLOrPath)

        filesync_done.send(sender=self, repositoryName=self.repositoryName, \
                               repositoryDir=self.repositoryURLOrPath)

    def __unicode__(self):
        return self.repositoryName

    def save(self, *args, **kwargs):
        super(Repository, self).save(*args, **kwargs)

    class Meta:
        ordering = ('repositoryName',)

