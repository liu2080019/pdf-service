FROM zenato/puppeteer

RUN mkdir -p /app

COPY fonts/ /usr/share/fonts

COPY . /app

WORKDIR /app

RUN npm i -g pm2

RUN npm i

ADD crontab /etc/cron.d/hello-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/hello-cron


RUN touch /var/log/cron.log

CMD cron && pm2-docker -i 4 index.js
