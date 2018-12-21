from .media.models import Media
from .media.serializers import MediaSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
import io

media = Media(title='Video Beco 1')
media.save()

serializer = MediaSerializer(media)
serializer.data

content = JSONRenderer().render(serializer.data)
content

stream = io.StringIO(content)
data = JSONParser().parse(stream)

serializer = MediaSerializer(data=data)
serializer.is_valid()

serializer.object
