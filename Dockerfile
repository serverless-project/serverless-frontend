FROM node:18.0.0 AS build
WORKDIR /app
COPY . /app/

# RUN npm config set registry=https://registry.npmmirror.com \
#     && cd /app && npm install && npm run build

FROM nginx:latest AS run

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/docs /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]