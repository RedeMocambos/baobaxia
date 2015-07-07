# encoding: utf-8
#!/usr/bin/env python
import sys, os, time, re, socket, atexit, commands
parentdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,parentdir)
from signal import SIGTERM
from socket import AF_INET, SOCK_DGRAM


from django.conf import settings

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

# Thanks to Sander Marechal for this Daemon code, taken from
# http://www.jejik.com/articles/2007/02/a_simple_unix_linux_daemon_in_python/
class Daemon:
    """
    A generic daemon class.
    Usage: subclass the Daemon class and override the run() method
    """

    def __init__(self, pidfile, stdin='/dev/null', stdout='/dev/null',
                 stderr='/dev/null'):
        self.stdin = stdin
        self.stdout = stdout
        self.stderr = stderr
        self.pidfile = pidfile
        self.args = []

    def daemonize(self):
        """
        do the UNIX double-fork magic, see Stevens' "Advanced 
        Programming in the UNIX Environment" for details (ISBN 0201563177)
        http://www.erlenstar.demon.co.uk/unix/faq_2.html#SEC16
        """

        try: 
            pid = os.fork() 
            if pid > 0:
                # exit first parent
                sys.exit(0) 
        except OSError, e: 
            sys.stderr.write("fork #1 failed: %d (%s)\n"
                             % (e.errno, e.strerror))
            sys.exit(1)

        # decouple from parent environment
        os.chdir("/") 
        os.setsid() 
        os.umask(0) 

        # do second fork
        try: 
            pid = os.fork() 
            if pid > 0:
                # exit from second parent
                sys.exit(0) 

        except OSError, e: 
            sys.stderr.write("fork #2 failed: %d (%s)\n" %
                             (e.errno, e.strerror))
            sys.exit(1) 

        # redirect standard file descriptors
        sys.stdout.flush()
        sys.stderr.flush()

        si = file(self.stdin, 'r')
        so = file(self.stdout, 'a+')
        se = file(self.stderr, 'a+', 0)
        os.dup2(si.fileno(), sys.stdin.fileno())
        os.dup2(so.fileno(), sys.stdout.fileno())
        os.dup2(se.fileno(), sys.stderr.fileno())

        # write pidfile
        atexit.register(self.delpid)
        pid = str(os.getpid())
        file(self.pidfile,'w+').write("%s\n" % pid)

    def delpid(self):
        os.remove(self.pidfile)

    def start(self):
        """
        Start the daemon
        """

        # Check for a pidfile to see if the daemon already runs
        try:
            pf = file(self.pidfile,'r')
            pid = int(pf.read().strip())
            pf.close()

        except IOError:
            pid = None

        if pid:
            message = "pidfile %s already exist. Daemon already running?\n"
            sys.stderr.write(message % self.pidfile)
            sys.exit(1)

        # Start the daemon
        self.daemonize()
        self.run()

    def stop(self):
        """
        Stop the daemon
        """

        # Get the pid from the pidfile
        try:
            pf = file(self.pidfile,'r')
            pid = int(pf.read().strip())
            pf.close()

        except IOError:
            pid = None

        if not pid:
            message = "pidfile %s does not exist. Daemon not running?\n"
            sys.stderr.write(message % self.pidfile)
            return # not an error in a restart

        # Try killing the daemon process        
        try:
            while 1:
                os.kill(pid, SIGTERM)
                time.sleep(0.1)

        except OSError, err:
            err = str(err)
            if err.find("No such process") > 0:
                if os.path.exists(self.pidfile):
                    os.remove(self.pidfile)
            else:
                print str(err)
                sys.exit(1)

    def restart(self):
        """
        Restart the daemon
        """

        self.stop()
        self.start()

    def run(self):
        """
        You should override this method when you subclass Daemon. 

        It will be called after the process has been daemonized by start()
        or restart().
        """

# TODO:
#  Use config instead of discovery of LAN address

class BibOSDaemon(Daemon):
    def run(self):
   
        # Gera mensagem no formato <uuid>|<uri>.

        msg ="<uuid>|<uri>"
 
        print >> sys.stderr, ("Running server, will reply with <uuid>|<uri>",
                              server_ip)
    
        sock = socket.socket(AF_INET, SOCK_DGRAM)
        sock.bind(('', PORT))
    
        while True:
            data, addr = sock.recvfrom(1024)
            print >> sys.stderr, "Got", data, "from", addr
            sock.sendto(MAGIC + msg, addr)
 
if __name__ == "__main__":
    daemon = BibOSDaemon(
        '/var/run/bbx-broadcast-daemon.pid',
        '/dev/null',
        '/var/log/bbx-broadcast-daemon.log',
        '/var/log/bbx-broadcast-daemon-err.log'
    )
    if len(sys.argv) == 1:
        if 'start' == sys.argv[1]:
            if len(sys.argv) > 2:
                daemon.args = sys.argv[2:]
            daemon.start()
        elif 'stop' == sys.argv[1]:
            daemon.stop()
        elif 'restart' == sys.argv[1]:
            daemon.restart()
        else:
            print "Unknown command"
            sys.exit(2)
        sys.exit(0)
    else:
        print "usage: %s start|stop|restart" % sys.argv[0]
        sys.exit(2)
