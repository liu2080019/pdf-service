/**
 * Created by fed on 2017/9/1.
 */
const koa = require('koa');
const bodyParser = require('koa-body');
const puppeteer = require('puppeteer');

const app = koa();

let refCount = 0;
let browser = null;

function getBrowser() {
  if (!browser) {
    return puppeteer.launch({ args: ['--no-sandbox'] }).then(br => {
      browser = br;
      return br;
    });
  }
  return Promise.resolve(browser);
}

setInterval(() => {
  if (refCount === 0) {
    browser.close();
    browser = null;
  }
}, 10 * 60 * 1000);

app.use(bodyParser({
  multipart: true,
}));

app.use(function *() {
  const browser = yield getBrowser();
  const page = yield browser.newPage();
  refCount++;
  yield page.goto('about:blank');
  const content = this.request.body.content || this.request.body.fields ? this.request.body.fields.content: '';
  yield page.setContent(content);
  yield page.waitForNavigation({ waitUntil: 'load' })
  this.type = 'application/pdf';
  this.body = yield page.pdf({ format: 'A4' });
  page.close();
  refCount--;
});


app.listen(process.env.PORT || 3000);
