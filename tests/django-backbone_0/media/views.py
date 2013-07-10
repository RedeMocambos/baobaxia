from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from media.models import Media
from media.serializers import MediaSerializer

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders it's content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
def media_list(request):
    """
    List all media, or create a new media.
    """
    if request.method == 'GET':
        medias = Media.objects.all()
        serializer = MediaSerializer(medias, many=True)
        return JSONResponse(serializer.data)
    
    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = MediaSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        else:
            return JSONResponse(serializer.errors, status=400)
        

@csrf_exempt
def media_detail(request, pk):
    """
    Retrieve, update or delete a code media.
    """
    try:
        media = Media.objects.get(pk=pk)
    except Media.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = MediaSerializer(media)
        return JSONResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = MediaSerializer(media, data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data)
        else:
            return JSONResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        media.delete()
        return HttpResponse(status=204)
