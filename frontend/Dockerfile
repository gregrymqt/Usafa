
#--- ESTÁGIO 1: Build (Construção) ---

FROM node:20-alpine AS build


#Define o diretório de trabalho dentro do container

WORKDIR /app

#Copia os arquivos de definição de pacotes

COPY package.json package-lock.json* ./

#Instala as dependências

RUN npm install

#Copia todo o resto do código-fonte do frontend

COPY . .

#Roda o comando de build de produção (para Vite, que cria a pasta 'dist')

#Se você usa create-react-app, mude 'dist' para 'build' no ESTÁGIO 2.

RUN npm run build

#--- ESTÁGIO 2: Serve (Servidor de Produção) ---

#Usamos uma imagem super leve do Nginx para servir os arquivos estáticos

FROM nginx:alpine

#Copia os arquivos estáticos (HTML, CSS, JS) do estágio de build

#para a pasta padrão do Nginx

#(Mude 'dist' para 'build' se você usar create-react-app)

COPY --from=build /app/dist /usr/share/nginx/html

#Copia o nosso arquivo de configuração customizado do Nginx

#Isso é VITAL para o React Router funcionar!

#Você deve criar este arquivo 'nginx.conf' na sua pasta 'frontend/'.

COPY nginx.conf /etc/nginx/conf.d/default.conf

#Expõe a porta 80 (padrão do Nginx)

EXPOSE 80

#Comando para iniciar o Nginx

CMD ["nginx", "-g", "daemon off;"]