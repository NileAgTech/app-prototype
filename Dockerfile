from node:14

# settign app home variable
ENV APP_HOME /app

# sets working directory for the application inside the docker image
WORKDIR ${APP_HOME}

# copying dependencies
COPY package-lock.json ${APP_HOME}
COPY package.json ${APP_HOME}

RUN npm install

# copies the source code
COPY . . 

EXPOSE 3000

CMD [ "npm", "start" ]
