from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from django.template import Template, RequestContext

from mocambola.serializers import UserSerializer
from bbx.auth import FileBackend

@api_view(['GET'])
def mocambola_list(request, repository, mucua):
    # retorna lista de mocambolas
    return Response('')


@api_view(['GET'])
def mocambola_detail(request, repository, mucua, mocambola):
    # retorna detalhes do user

    try:
        user = User.objects.get(username=mocambola)
    except User.DoesNotExist:
        return Response('Usuario inexistente.')

    # TODO: verificar questao abaixo:
    #  atualmente, esta serializando o user
    #  possivelmente, teria que ter um serializer especifico para mocambola
    #  deixando em aberto

    # serializa e da saida
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
def login(request):
    print request.method
    if request.method == 'GET':
        # gera token para tela de login
        c = RequestContext(request, {'autoescape': False})
        c.update(csrf(request))
        t = Template('{ "csrftoken": "{{ csrf_token  }}" }')
        return HttpResponse(t.render(c), mimetype=u'application/json')
        
    elif request.method == 'POST':
        username = request.DATA['username'] + '@' + request.DATA['mucua'] + '.' + request.DATA['repository'] + '.net'
        password = request.DATA['password']
        fileBackend = FileBackend()
        authenticate = fileBackend.authenticate(username, password)
        if (authenticate):
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                logger.debug(u"%s" % (
                        _('Exception caught, UserDoesNotExist')
                        ))                
            if user:
                serializer = UserSerializer(user)
                return Response(serializer.data)
            else:
                return Response('Usuario inexistente.')
        else:
                return Response('Usuario ou senha invalid@s.')
