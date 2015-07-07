from time import sleep
from socket import socket, AF_INET, SOCK_DGRAM, SOL_SOCKET, SO_BROADCAST, gethostbyname, gethostname

from django.core.management.base import BaseCommand
from django.utils import timezone

from bbx.settings import DEFAULT_IP, DEFAULT_MUCUA
from bbx.utils import logger
from mucua.models import Mucua

"""
Definicoes do comando para anunciar a mucua na rede local
"""

class Command(BaseCommand):
    """Anuncia a mucua na rede local"""
    help = 'Anuncia a mucua na rede local'

    def handle(self, *args, **options):

        PORT = 50505
        MAGIC = "bbx-discover"

        s = socket(AF_INET, SOCK_DGRAM) #create UDP socket                                                                                                                                
        s.bind(('', 0))
        s.setsockopt(SOL_SOCKET, SO_BROADCAST, 1) #this is a broadcast socket                                                                                                            
        mucua = Mucua.objects.get(description=DEFAULT_MUCUA)

        mucua_uri= mucua.uuid + '|' + 'ssh://' + DEFAULT_IP + '/data/bbx/repositories/mocambos'

        while 1:
            data = MAGIC + mucua_uri
            s.sendto(data, ('<broadcast>', PORT))
            logger.info('Enviado anuncio da mucua!')
            sleep(1)

