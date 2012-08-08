from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    return HttpResponse("REDE MOCAMBOS / Baobaxia - Em desenvolvimento...")

def publica(request):
    return HttpResponse("REDE MOCAMBOS / Baobaxia - Publica! ")

