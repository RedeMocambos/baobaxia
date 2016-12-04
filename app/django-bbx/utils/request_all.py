from media.models import Media

ms = Media.objects.filter(is_local=False, is_requested=False)

print "Requesting {0} new media.".format(ms.count())

for m in ms:
    m.request_copy()


print "Done requesting {0} new media.".format(ms.count())
