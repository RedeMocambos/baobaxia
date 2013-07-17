from django.core.management.base import NoArgsCommand, CommandError

from gitannex.models import GitAnnexRepository, runScheduledJobs

"""
Definicoes do comando para executar as operacoes planejadas.
"""

class Command(NoArgsCommand):
    """Executa as operacoes planejadas."""
    help = 'Run scheduled jobs related to git repositories'

    def handle_noargs(self, **options):
        runScheduledJobs()
        
