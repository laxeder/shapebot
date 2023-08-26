FROM node:20-buster

## Configurando variáveis de Ambiente
ENV APP_HOME=/build
ENV NODE_ENV="production"

## Diretorio de trabalho
WORKDIR "$APP_HOME"

LABEL description="spbt-prod"

LABEL org.opencontainers.image.name="spbt-prod"
LABEL org.opencontainers.image.authors="laxederbr@gmail.com"
LABEL org.opencontainers.image.hostname="spbt-prod"

LABEL com.docker.volume.name='spbt-prod'
LABEL com.docker.network.bridge.name='spbt-prod'

## Atualizando pacotes
RUN apt update && apt upgrade -y
RUN apt install build-essential -y
RUN apt install npm -y

RUN npm install -g node-gyp
RUN npm install -g rimraf
RUN npm install -g pm2
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install -g tsc-alias
RUN npm install -g tsconfig-paths

# Arquivos de iniciacao para o node
COPY package*.json ./

## Instalando dependências
RUN npm install

## Copia projeto
COPY ./ ./

## Buildado arquivos
RUN npm run build

## Porta de acesso
EXPOSE 8082

## diretorio padrao
VOLUME "$APP_HOME"

## Start do ambiente
CMD [ "pm2-runtime", "start", "npm run start" ]
