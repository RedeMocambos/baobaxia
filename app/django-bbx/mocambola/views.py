import json

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from django.template import Template, RequestContext
from django.utils.translation import ugettext as _

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
        response_data = {
            'error': True,
            'errorMessage': _('User don\t exists')
        }
            
        return HttpResponse(json.dumps(response_data), mimetype=u'application/json')

    # TODO: verificar questao abaixo:
    #  atualmente, esta serializando o user
    #  possivelmente, teria que ter um serializer especifico para mocambola
    #  deixando em aberto

    # serializa e da saida
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
def login(request):
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
        
        # TODO: get this data from logger or bbx/auth.py,
        # so the next section won't be needed anymore
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
                response_data = {
                    'errorMessage': _('User don\'t exists: ')
                }
            return HttpResponse(json.dumps(response_data), mimetype=u'application/json')
        else:
            response_data = {
                'error': True,
                'errorMessage': _('Invalid user or password')
            }
            
            return HttpResponse(json.dumps(response_data), mimetype=u'application/json')


@api_view(['POST'])
def create_auth(request):
    serialized = UserSerializer(data=request.DATA)
    if serialized.is_valid():
        User.objects.create_user(
            username=serialized.init_data['username'],
            password=serialized.init_data['password'],
            email=serialized.init_data['email']
        )
        return Response(serialized.data,
                        status=status.HTTP_201_CREATED)
    else:
        return Response(serialized._errors,
                        status=status.HTTP_400_BAD_REQUEST)
