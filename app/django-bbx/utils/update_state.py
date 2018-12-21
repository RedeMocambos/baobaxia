from media.models import Media

ms = Media.objects.filter(is_local=False, is_requested=True)
n = ms.count()

print("Testing {0} media.".format(n))

for m in ms:
    m.set_is_local()
    if m.is_local:
        m.save()

print("Status changed on {0} media".format(
    n - Media.objects.filter(is_local=False, is_requested=True).count()
))
