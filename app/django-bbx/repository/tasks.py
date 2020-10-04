# -*- coding: utf-8 -*-

import subprocess
from subprocess import PIPE
#from celery import task

from bbx.utils import logger


#CELERY_IMPORTS = ('repository.tasks', )

#afazeres = Celery('tasks', broker='amqp://guest@localhost//', backend='amqp')

#@afazeres.task
#@task
def git_annex_get(repository_path, media_path):
    """ 
    Baixa os conteudos binarios desde o repositório remoto.
    Retorna o output do git annex get.
    """
    # TODO: Next release with possibility to choice what to get

    cmd = 'git annex get ' + media_path
    logger.info(cmd)
    pipe = subprocess.Popen(cmd, shell=True, cwd=repository_path)
    output, error = pipe.communicate()
#    return output
