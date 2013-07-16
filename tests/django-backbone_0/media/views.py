from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from media.models import Media
from media.serializers import MediaSerializer

@api_view(['GET', 'POST'])
def media_list(request, format=None):
    """
    List all medias, or create a new media.
    """
    if request.method == 'GET':
        medias = Media.objects.all()
        serializer = MediaSerializer(medias, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MediaSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def media_detail(request, pk, format=None):
    """
    Retrieve, update or delete a media instance.
    """              
    try:
        media = Media.objects.get(pk=pk)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MediaSerializer(media)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MediaSerializer(media, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def upload(request):
    serializer = MediaSerializer(data=request.DATA)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.shortcuts import get_object_or_404, render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from media.forms import MediaForm
from media.models import Media
import uuid

# ...
def publish(request):
    '''
    A publish cuida de criar o form do zero, receber os resultados de um form e criar o media a partir do arquivo.
    Form (sobe arquivo) -> Retorna um form semipreenchido com ja o uuid do media  

    '''
    if request.method == 'POST':
        form = MediaForm(request.POST, request.FILES)
        if form.is_valid():
            # file is saved
            instance = Media(file_field=request.FILES['file'])
            instance.uuid = uuid4()
            instance.type = request.FILES['file'].content_type
            request.FILES['file'].temporary_file_path

                        
            instance.save()
            return HttpResponseRedirect('/media/')
    else:
        form = MediaForm()
    return render(request, 'publish.html', {'form': form})


def handle_uploaded_file(data):
    with open('/tmp/test.bbx', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)







