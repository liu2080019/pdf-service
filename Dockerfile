FROM zenato/puppeteer

RUN mkdir -p /app

RUN apt-get update && apt-get install -y --force-yes --no-install-recommends fonts-wqy-microhei ttf-wqy-zenhei

COPY . /app

WORKDIR /app

RUN npm i -g pm2

RUN npm i

CMD ["pm2-docker", "-i", "4" , "index.js"]
