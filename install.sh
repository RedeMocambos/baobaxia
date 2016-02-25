#!/bin/bash

# script de instalação do baobáxia
USER_BBX='exu'
USER_BBX_PASSWD='abre os caminhos'
UID_BBX=10000
BBX_DIR_NAME='bbx'
DEFAULT_REPOSITORY_DIR_NAME='repositories'
DEFAULT_MEDIA_ROOT='/data/bbx/'
DEFAULT_REPOSITORY_DIR=$DEFAULT_MEDIA_ROOT$DEFAULT_REPOSITORY_DIR_NAME
DEFAULT_REPOSITORY_NAME='mocambos'
INSTALL_DIR='/srv/bbx'
LOG_DIR='log/'
PACK_DIR='/root/baobaxia'
#PACK_FILE='pip_wheel_20140606.tbz'
BBX_LOCAL_REPO='/root/baobaxia'
BBX_REMOTE_REPO='https://github.com/RedeMocambos/baobaxia'

create_user() {
    USERNAME=$1
    USER_UID=$2
    # checa se usuario ja existe
    USER_EXISTS=`cat /etc/passwd | grep $USER_BBX`
    if [[ "$USER_EXISTS" == '' ]]; then
	echo "criando usuario $USER_BBX ..."
	useradd --uid $USER_UID --create-home -p "$USER_BBX_PASSWD" --shell /bin/bash $USERNAME
    fi
}


# PRE: pkgs:

# dependencies: se for deb pkg, tirar
COMMON_PKG="git git-annex-standalone nginx supervisor python-pip rabbitmq-server libjpeg-dev libtiff5-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk python-dev python-setuptools gettext"
DEBIAN_PKG="libjpeg62-turbo-dev"
UBUNTU_PKG="libjpeg-turbo8-dev"

if [ ! -f /usr/bin/lsb_release ]; then
  apt-get update
  apt-get install -y lsb-release
fi
DISTRO_VERSION="$(lsb_release -c -s)"

if [ -n "$(grep -i ubuntu /etc/os-release )" ]; then
  PACKAGES="$COMMON_PKG $UBUNTU_PKG"
else
  PACKAGES="$COMMON_PKG $DEBIAN_PKG"
fi

wget -q -O- http://neuro.debian.net/lists/${DISTRO_VERSION}.gr.full > /etc/apt/sources.list.d/neurodebian.sources.list
apt-key adv --recv-keys --keyserver hkp://pgp.mit.edu:80 0xA5D32F012649A5A9

apt-get update
apt-get install -y $PACKAGES || exit 1

### cria diretorio basico
mkdir -p $DEFAULT_REPOSITORY_DIR


# 1) escolha do nome da mucuaLocal
echo "------------------------"
echo "          /"
echo "    \_ \ /"
echo "      \ |  /___"
echo "  <==  \| /   ()"
echo "  ==>   ||    NPDD/Rede Mocambos"
echo "  nnn   ||/   "
echo "        ||    http://wiki.mocambos.net/wiki/NPDD"
echo "        ||    Vamos fazer um mundo digital mais do nosso jeito..."
echo "______/~~~~\_____________________________________________________________ _ _ _"
echo ""
echo " E ku abo ilê Baobáxia!"
echo " Bem vindo ao Baobáxia!"
echo " Welcome to Baobáxia!"
echo ""
echo "Esse é o instador do Baobáxia. "
echo ""
echo "----------------"
echo "Escolha o nome da sua mucua"
echo "----------------"
echo ""
read -p `hostname`" -> este é o nome da sua mucua? (s/n)" ESCOLHA
case "$ESCOLHA" in
    s|S|*) MUCUA=`hostname`;;
    n|N) read -p "Escolha o nome da mucua: " MUCUA ;;
esac
echo ""
echo "O nome da mucua é $MUCUA"
echo ""

echo "----------------"
echo " Escolha o endereço da sua mucua"
echo "----------------"
echo ""
MUCUA_URL=
read -p `hostname`".mocambos.net -> este é o url da sua mucua? (s/n)" ESCOLHA
case "$ESCOLHA" in
    s|S|*) MUCUA_URL=`hostname`".mocambos.net";;
    n|N) read -p "Escolha o url da mucua: " MUCUA_URL;;
esac
echo ""
echo "O url da mucua é $MUCUA_URL"
echo ""


echo ""
echo "Criando usuário padrão para o Baobáxia ..."
create_user $USER_BBX $UID_BBX

# define repositorioRemoto para espelhar / caminho do repositório
echo "----------------"
echo "Defina um repositório remoto para espelhar:"
echo "----------------"
echo ""
echo "É possível conectar-se de diferentes formas a um repositório:"
echo "- pela rede (ssh)"
echo "- por um dispositivo externo: pendrive, hd externo (media)"
echo "- de uma pasta local (local)"
read -p "Como você vai conectar? (ssh/media/local, padrão é local)" PROTOCOL
case "$PROTOCOL" in
    # git clone via ssh
    ssh|SSH) PROTOCOL='ssh';
	echo "Acessar repositório via ssh..."
	read -p "Defina a url do repositório para espelhar (padrão: dpadua.mocambos.net):" MIRROR_REPOSITORY_NAME
	case $MIRROR_REPOSITORY_NAME in
	    '') MIRROR_REPOSITORY_NAME="dpadua.mocambos.net" ;;
	esac
	# TODO travar caso nao definir
	read -p "Defina a porta do repositório para espelhar (padrão: 9022):" MIRROR_REPOSITORY_PORT
	case $MIRROR_REPOSITORY_PORT in
	    '') MIRROR_REPOSITORY_PORT=9022 ;;
	esac
	read -p "Defina a pasta do repositório para espelhar (padrão: $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME):" MIRROR_REPOSITORY_FOLDER
	case $MIRROR_REPOSITORY_FOLDER in
	    '') MIRROR_REPOSITORY_FOLDER="$DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME" ;;
	esac
	cd $DEFAULT_REPOSITORY_DIR
	git clone ssh://$USER_BBX@$MIRROR_REPOSITORY_NAME:$MIRROR_REPOSITORY_PORT/$MIRROR_REPOSITORY_FOLDER
	;;
    # git clone de media
    media|MEDIA) PROTOCOL='media'
	echo ""
	echo "Conecte o drive externo ou pendrive."
	echo "Aperte ENTER quando inserir"
	read

	# TODO: travar até que o repositorio seja inserido
	# verificar se nos pontos de montagem ha algo que seja um hd de repositorio
	IS_BBX_REPO=false
	for USB_DEVICE in `cat /proc/mounts  | grep usb | cut -d' ' -f2`; do
	    echo 'Dispositivo USB encontrado: '$USB_DEVICE
	    for REPO in `find $USB_DEVICE -name 'description' | grep .git`; do
		if [[ `cat $REPO` == "baobaxia" ]]; then
		    IS_BBX_REPO=true
		    REPO_NAME=$USB_DEVICE/`echo $REPO | cut -d '/' -f4`
		    break
		fi
	    done
	done;
	if [[ $IS_BBX_REPO == "" ]]; then
	    echo "Insira um dispositivo com um repositório válido."
	    exit 0
	fi

	echo ""
	echo "Espelhando repositório..."
	cd $DEFAULT_REPOSITORY_DIR
	git clone $REPO_NAME
	;;
  local|LOCAL|*) PROTOCOL='local'
	read -p "Defina a pasta do repositório para espelhar (padrão: /root/baobaxia/mocambos):" MIRROR_REPOSITORY_FOLDER
	case $MIRROR_REPOSITORY_FOLDER in
	    '') MIRROR_REPOSITORY_FOLDER="/root/baobaxia/mocambos" ;;
	esac
	cd $DEFAULT_REPOSITORY_DIR
	git clone $MIRROR_REPOSITORY_FOLDER
	;;

esac

## configurar permissoes
echo ""
echo "Configurando permissões do repositório"
chown -R $USER_BBX:$USER_BBX $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME
chmod -R 775 $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME

echo ""
echo "Definindo usuário git para usuário do baobáxia ($USER_BBX) ..."
echo "Criando novo repositório na mucua $MUCUA ..."
su - $USER_BBX -c "
if [ -d $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME ]; then
  cd $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME;
else
  mkdir $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME;
fi
git config --global user.name 'Exu do BBX';
git config --global user.email 'exu@mocambos.org';
git init . ;
git annex init $MUCUA;
git annex describe here $MUCUA;
"

# 5) criar diretórios locais
echo ""
echo "Criando diretórios locais da mucua $MUCUA ..."
mkdir -p $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME/$MUCUA/mocambolas
mkdir -p $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME/$MUCUA/requests
mkdir -p $INSTALL_DIR/bin
mkdir -p $INSTALL_DIR/media
mkdir -p $INSTALL_DIR/static
mkdir -p $INSTALL_DIR/run
mkdir -p $INSTALL_DIR/log
mkdir -p $INSTALL_DIR/log/celery
mkdir -p $INSTALL_DIR/envs
mkdir -p $DEFAULT_MEDIA_ROOT/db
mkdir -p $DEFAULT_MEDIA_ROOT/cache
chown -R $USER_BBX:$USER_BBX $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME
chmod -R 775 $DEFAULT_REPOSITORY_DIR/$DEFAULT_REPOSITORY_NAME
chown -R $USER_BBX:$USER_BBX $INSTALL_DIR
chmod -R 775 $INSTALL_DIR
chown -R $USER_BBX:$USER_BBX $DEFAULT_MEDIA_ROOT/db
chmod -R 775 $DEFAULT_MEDIA_ROOT/db
chown -R $USER_BBX:$USER_BBX $DEFAULT_MEDIA_ROOT/cache
chmod -R 775 $DEFAULT_MEDIA_ROOT/cache

echo ""
echo "Copiando arquivos do Baobáxia ..."
cd $INSTALL_DIR
# GARANTIR PERMISSAO DE GRAVACAO
# TODO: pegar futuramente um pacote offline

echo ""
read -p "De onde você vai baixar o repositório do baobáxia? (ex: https://github.com/RedeMocambos/baobaxia) - (1 - local / 2 - internet): " BBX_REPO_FROM
case "$BBX_REPO_FROM" in
    2|internet) BBX_REPO_FROM=$BBX_REMOTE_REPO ;;
    1|local|*) BBX_REPO_FROM=$BBX_LOCAL_REPO ;;
esac
git clone $BBX_REPO_FROM baobaxia
cd $INSTALL_DIR/baobaxia

echo ""
echo "Criando arquivo de configuração do Baobáxia ..."
cp $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.example.py $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py
sed -i "s:^\(MEDIA_ROOT\s*=\s*\).*$:\1\"${DEFAULT_MEDIA_ROOT}\":" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py
sed -i "s:^\(DEFAULT_MUCUA\s*=\s*\).*$:\1\"${MUCUA}\":" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py
sed -i "s:^\(REPOSITORY_DIR_NAME\s*=\s*\).*$:\1\"${DEFAULT_REPOSITORY_DIR_NAME}\":" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py
sed -i "s:^\(DEFAULT_REPOSITORY\s*=\s*\).*$:\1\"${DEFAULT_REPOSITORY_NAME}\":" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py
sed -i "s:^\(STATIC_ROOT\s*=\s*\).*$:\1\"${INSTALL_DIR}\/static\":" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/settings.py

echo ""
echo "Configurando interface web ..."
cp $INSTALL_DIR/baobaxia/app/django-bbx/bbx/static/js/config.js.example $INSTALL_DIR/baobaxia/app/django-bbx/bbx/static/js/config.js
sed -i "s/dpadua/${MUCUA}/" $INSTALL_DIR/baobaxia/app/django-bbx/bbx/static/js/config.js


### instalacao do baobaxia
echo ""
echo "Criando ambiente virtual do python ..."
pip install --upgrade pip
# atualiza mapa das variaveis de ambiente
hash -r
# cria ambiente virtual
pip install virtualenv
#cp $PACK_DIR/$PACK_FILE $INSTALL_DIR/
chown root:$USER_BBX $INSTALL_DIR/envs
chmod 775 $INSTALL_DIR/envs
#xhost +
su - $USER_BBX -c "
virtualenv $INSTALL_DIR/envs/bbx ;
. $INSTALL_DIR/envs/bbx/bin/activate ;
pip install --upgrade setuptools ;
cd $INSTALL_DIR;
pip install argparse;
pip install django==1.6.7;
pip install django-extensions;
pip install djangorestframework==2.4.4;
pip install gunicorn;
pip install six;
pip install Pillow;
pip install sorl-thumbnail;
pip install south;
pip install wheel;
pip install wsgiref;
pip install python-magic;
pip install python-memcached;
pip install longerusername;
pip install djangorestframework-jwt;
pip install celery==3.1.14
"

echo ""
echo "Definindo permissões do baobáxia ..."
chown -R $USER_BBX:$USER_BBX $INSTALL_DIR/baobaxia

echo ""
echo "Criando banco de dados do baobáxia ..."
su - $USER_BBX -c "
. $INSTALL_DIR/envs/bbx/bin/activate;
cd $INSTALL_DIR/baobaxia/app/django-bbx;
find . -name '000*.py' -exec rm '{}' \; && echo 'OK!';
python manage.py syncdb --noinput;
python manage.py schemamigration --initial --traceback mocambola;
python manage.py schemamigration --initial --traceback mucua;
python manage.py schemamigration --initial --traceback tag;
python manage.py schemamigration --initial --traceback media;
python manage.py schemamigration --initial --traceback repository;
python manage.py migrate --all;
python manage.py collectstatic --noinput
"

echo ""
echo "usuário do login número 1:"
echo "username: exu@dpadua.mocambos.net"
echo "senha: livre"

echo ""
echo "Configurando o gunicorn ..."
cp $INSTALL_DIR/baobaxia/bin/gunicorn_start.sh.example $INSTALL_DIR/bin/gunicorn_start.sh
sed -i "s:_domain_:${BBX_DIR_NAME}:g" $INSTALL_DIR/bin/gunicorn_start.sh
touch $INSTALL_DIR/log/gunicorn_supervisor.log
chmod +x $INSTALL_DIR/bin/gunicorn_start.sh
chmod 775 $INSTALL_DIR/log/gunicorn_supervisor.log
chown $USER_BBX:$USER_BBX $INSTALL_DIR/log/gunicorn_supervisor.log


# 7) recriar mucuas da rede no django-bbx (mucuaLocal)
# sync a partir dos jsons
echo ""
echo "Primeira sincronização, criando objetos a partir dos arquivos ..."
su - $USER_BBX -c "
. $INSTALL_DIR/envs/bbx/bin/activate;
cd $INSTALL_DIR/baobaxia/app/django-bbx/;
python manage.py bbxsync mocambos
"

echo ""
echo "Criando arquivo de configuração do NGINX ..."
cp $INSTALL_DIR/baobaxia/conf/nginx/bbx /etc/nginx/sites-available/bbx

sed -i "s:_domain_:${BBX_DIR_NAME}:g" /etc/nginx/sites-available/bbx
sed -i "s:_domainaliases_:${MUCUA} ${MUCUA_URL}:g" /etc/nginx/sites-available/bbx
ln -s /etc/nginx/sites-available/bbx /etc/nginx/sites-enabled/bbx

echo ""
echo "Ativando NGINX ..."
service nginx restart

echo ""
echo "Criando arquivo de configuração do Supervisor para Celery..."
cp $INSTALL_DIR/baobaxia/conf/supervisor/celeryd /etc/supervisor/conf.d/celeryd.conf

echo ""
echo "Criando arquivo de configuração do Supervisor para BBX..."
cp $INSTALL_DIR/baobaxia/conf/supervisor/bbx /etc/supervisor/conf.d/bbx.conf
sed -i "s:_domain_:${BBX_DIR_NAME}:g" /etc/supervisor/conf.d/bbx.conf

echo ""
echo "Ativando supervisor..."
service supervisor restart

echo ""
echo "Instalando script para atualizar o BBX (update-templates) ..."
cp $INSTALL_DIR/baobaxia/bin/update-templates.sh.example $INSTALL_DIR/bin/update-templates.sh
chmod +x $INSTALL_DIR/bin/update-templates.sh

echo ""
echo "Ativando o Baobáxia ..."
supervisorctl restart bbx
supervisorctl restart celery


echo ""
echo "Instalando script de sincronização (bbx-cron) ..."
cp $INSTALL_DIR/baobaxia/bin/bbx-cron.sh.example $INSTALL_DIR/bin/bbx-cron.sh
chmod +x $INSTALL_DIR/bin/bbx-cron.sh

echo ""
echo "Instalando script para pedidos de arquivos (process-requests) ..."
cp $INSTALL_DIR/baobaxia/bin/process-requests.sh.example $INSTALL_DIR/bin/process-requests.sh
chmod +x $INSTALL_DIR/bin/process-requests.sh
echo ""

echo ""
echo " >>> Instalação completa! <<< "
echo ""
echo "Lembre-se de entrar como usuario exu e pedir pra abrir os caminhos, lançando este script..."
echo "exu@"$MUCUA': /srv/bbx/bin/update-templates.sh'

echo ""
echo "Pode acessar essa mucua por esses endereços (depende da sua rede local):"
echo " http://"$MUCUA
echo " http://127.0.0.1"
echo " http://"`hostname -I`
echo ""

echo ""

echo "          /                                                                          "
echo "     _ \ /                                                                           "
echo "      \_| |/__                                                                       "
echo " <==    | /  ()                                                                      "
echo " ==>    |/   NPDD/Rede Mocambos                                                      "
echo " nnn    |                                                                            "
echo "        |    http://wiki.mocambos.net/wiki/NPDD                                      "
echo "        |    'Vamos fazer um mundo digital mais do nosso jeito...'                   "
echo "______/~~~\________________________________________________________________ _ _ _    "
echo "       /                                                                             "
echo "      BAOBÁXIA                                 Software LIVRE! GPLv3                 "

echo ""
