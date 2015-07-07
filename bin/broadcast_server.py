# encoding: utf-8
#!/usr/bin/env python
import sys, os, time, re, socket, atexit, commands
parentdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,parentdir)
from signal import SIGTERM
from socket import AF_INET, SOCK_DGRAM


#from django.conf import settings

# MAGIC pra sincronizar a comunicação
MAGIC = "BBX Mucua"

PORT = 42420

def find_lan_addresses():
    get_ip = False
    for line in commands.getoutput("/sbin/ifconfig").split("\n"):
        if re.match('^\s*eth\d+\s+', line):
            get_ip = True
        else:
            if get_ip:
                m = re.search('addr:(\d+.\d+.\d+.\d+)\s*' +
                              'Bcast:(\d+.\d+.\d+.\d+)',
                              line)
                if m is not None:
                    return (m.group(1), m.group(2))
                get_ip = False
    return (None, None)


if __name__ == "__main__":

    # Gera mensagem no formato <uuid>|<uri>.
    uuid = sys.argv[1]
    uri = sys.argv[2]
    msg ="{0}|<{1}>".format(uuid, uri)
 
    print >> sys.stderr, ("Running server, will reply with <uuid>|<uri>", msg)
    
    sock = socket.socket(AF_INET, SOCK_DGRAM)
    sock.bind(('', PORT))

    while True:
        data, addr = sock.recvfrom(1024)
        print >> sys.stderr, "Got", data, "from", addr
        sock.sendto(MAGIC + msg, addr)

