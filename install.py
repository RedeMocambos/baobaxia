# script de instalação do baobáxia

# 1) escolha do nome da mucuaLocal

# 2) define repositorioRemoto para espelhar / caminho do repositório 

# 3) clonar repositório da mucuaRemota

# git clone ...

# git remote 

# 4) criar instância da mucua com nome da mucuaLocal
# git annex init [nome-da-mucua]

# 5) criar diretórios 
# mkdir -p [mucuaLocal]/mocambolas

# 6) cria banco de dados do django-bbx e faz primeiras migrações
# ./app/django-bbx/limpa_bd.sh

# 7) recriar mucuas da rede no django-bbx (mucuaLocal)
