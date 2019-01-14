#!/usr/bin/env python

#
# Script para publicar os videos das transmissoes ao vivo da 
# Tv Taina no Baobáxia. 
#

import sys, os, shutil, json
from subprocess import call

# Função para criar pastas e subpastas 
def mkdirp(dirpath):
    if not os.path.exists(dirpath):
        os.makedirs(dirpath)

# Exemplo de padrao de nome dos arquivos:
# 939902938656350019133335-2019-01-07_02:16.mp4
# 
# Pega o nome do arquivo da linha de comando
filename = sys.argv[1]

# Pegando o nome e a data do video a partir do nome do mp4
nome = "transmissao" + filename[:24]
ano = filename[27:29]
mes = filename[30:32]
dia = filename[33:35]

print("Name: " + nome)
print("Ano: " + ano)
print("Mes: " + mes)
print("Dia: " + dia)

# Criando a pasta no repositorio do bbx
pastadestino = os.path.join("/data/bbx/repositories/mocambos/abdias/video/", ano, mes, dia)
mkdirp(pastadestino)

# Movendo o arquivo pra la
filebasename = os.path.basename(filename)
destino = os.path.join(pastadestino, filebasename)
shutil.move(filename, destino)
os.chdir(pastadestino)

# Colocando o mp4 no git annex 
call(["git", "annex", "add", filebasename])


# Criando o arquivo de metadados json
filejson = os.path.splitext(filebasename)[0]+".json"

url = os.path.join("/media", "mocambos", "abdias", "video", ano, mes, dia, filebasename)

metadata = ({
    'date': "20" + ano + "-" + mes + "-" + dia + "T12:00:00.000Z",
    'uuid': nome,
    'name': nome,
    'note': "",
    'author' : "exu@dpadua.mocambos.net",
    'type': "video",
    'format': "mp4",
    'license': "cc_ci_nc",
    'media_file': destino,
    'url': url,
    'origin': "abdias",
    'repository': "mocambos"
})

with open(filejson, 'w') as outfile:
    json.dump(metadata, outfile)

# Adicionando o json dos metadados no versionamento git
call(["git", "add", filejson])
call(["git", "commit", "-m", "Novo video de uma transmissao"])

# Atualizando o banco de media do site django
call(["/srv/bbx/bin/bbx-cron.sh"])










