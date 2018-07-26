FROM node:carbon

# Create app directory
WORKDIR /var/app

# Install app dependencies
COPY . /var/app

RUN npm install --quiet && \
    npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
