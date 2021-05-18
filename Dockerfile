from node:14

ENV APP_HOME /app

WORKDIR ${APP_HOME}

COPY package-lock.json ${APP_HOME}
COPY package.json ${APP_HOME}

RUN npm install

COPY . . 

EXPOSE 3000

CMD [ "npm", "start" ]
