#!/bin/bash

# Diretório de origem
source_dir="./data"

# Diretório de destino com a data atual e milissegundos
backup_dir="./backups/$(date +'%Y-%m-%d-%H-%M-%S-%3N')"

# Verifica se o diretório de origem existe
if [ ! -d "$source_dir" ]; then
  echo "O diretório de origem '$source_dir' não existe."
  exit 1
fi

# Cria o diretório de backup se não existir
if [ ! -d "$backup_dir" ]; then
  mkdir -p "$backup_dir"
fi

# Copia os arquivos de origem para o diretório de backup
cp -r "$source_dir"/* "$backup_dir"

echo "Backup concluído em '$backup_dir'."
