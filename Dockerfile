FROM zenato/puppeteer

RUN mkdir -p /app

COPY fonts/ /usr/share/fonts

COPY . /app

WORKDIR /app

RUN echo "Asia/Shanghai" > /etc/timezone

RUN npm i -g pm2

RUN npm i

RUN apt-get update -y && apt-get install -y cron

# Give execution rights on the cron job
RUN chmod 0644 /app/crontab

RUN touch /var/log/cron.log

CMD crontab /app/crontab && pm2-docker -i 4 index.js
