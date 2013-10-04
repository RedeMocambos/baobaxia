from django.contrib.auth.models import User
from django.db import models
from mucua.models import Mucua


def getFilePath(instance):
    if instance.date == '':
        t = datetime.now
        date = t.strftime("%y/%m/%d/")
    else:
        date = instance.date.strftime("%y/%m/%d/")

    t = datetime.now()
    return os.path.join(REPOSITORY_DIR, instance.getRepository(),
                        instance.getMucua(), instance.getType(),
                        date)

class MocambolaMucua(models.Model):

    mucua = models.ForeignKey(Mucua)
    user = models.ForeignKey(User)
    
    def save(self, *args, **kwargs):
        # Serializar aqui o na post_save
        return super(MocambolaMucua, self).save(*args, **kwargs)



@receiver(post_save, sender=MocambolaMucua)
def MocambolaMucuaPostSave(instance, **kwargs):
    """Intercepta o sinal de *post_save* do MocambolaMucua, serialize a adiciona o objeto ao repositorio."""
    logger.debug(instance.type)
    logger.debug(type(instance))
    gitAdd(instance.mucua.repository.getFileName(), getFilePath(instance))

    # Retomar o custom user o autentication backend.. precisa religar
    # mocambola com mucua para pegar o path do arquivo.

    serializer = MocambolaMucuaSerializer(instance)
    print serializer.getJSON()
#    gitAdd(instance.getFileName(), getFilePath(instance))                                                                                                   

    # REFAZER .. 
    mediapath = getFilePath(instance)+'/'
    mediadata = instance.uuid + '.json'
    fout = open(mediapath + mediadata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    gitAdd(mediadata, mediapath)
    gitCommit(instance.getFileName(), instance.author.username, instance.author.email, getFilePath(instance))



