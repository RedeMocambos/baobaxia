import logging
import django.dispatch

"""
Arquivo de definicao dos sinais.

Os sinais sao usados para interligar diferentes *apps* do Django. 
"""

def get_subclasses(classes, level=0):
    """
    Procura as subclasses da uma classe dada, retorna a lista de subclasses.

    Return the list of all subclasses given class (or list of classes) has.
    Inspired by this question:
    http://stackoverflow.com/questions/3862310/how-can-i-find-all-subclasses-of-a-given-class-in-python
    """
    # for convenience, only one class can can be accepted as argument
    # converting to list if this is the case
    if not isinstance(classes, list):
        classes = [classes]

    if level < len(classes):
        classes += classes[level].__subclasses__()
        return get_subclasses(classes, level+1)
    else:
        return classes

def receiver_subclasses(signal, sender, dispatch_uid_prefix, **kwargs):
    """
    Decorador para conectar todos os sinais do *receiver* e das subclasses do *receiver*.

    A decorator for connecting receivers and all receiver's subclasses to signals. Used by passing in the
    signal and keyword arguments to connect::

        @receiver_subclasses(post_save, sender=MyModel)
        def signal_receiver(sender, **kwargs):
            ...
    """
    def _decorator(func):
        all_senders = get_subclasses(sender)
        logging.info(all_senders)
        for snd in all_senders:
            signal.connect(func, sender=snd, dispatch_uid=dispatch_uid_prefix+'_'+snd.__name__, **kwargs)
        return func
    return _decorator


## Novo sinal para alertar que os repositorios sao sincronizados
filesync_done = django.dispatch.Signal(providing_args=["repositoryName", "repositoryDir"])
