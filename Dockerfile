FROM zenato/puppeteer

RUN mkdir -p /app

COPY fonts/ /usr/share/fonts

COPY . /app

WORKDIR /app

RUN npm i -g pm2

RUN npm i

CMD ["pm2-docker", "-i", "4" , "index.js"]
