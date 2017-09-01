/**
 * Created by fed on 2017/9/1.
 */
const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const puppeteer = require('puppeteer');

const app = koa();

let refCount = 0;
let browser = null;

function getBrowser() {
  if (!browser) {
    return puppeteer.launch().then(br => {
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

app.use(bodyParser());

app.use(function *() {
  const browser = yield getBrowser();
  const page = yield browser.newPage();
  refCount++;
  yield page.goto('about:blank');
  yield page.setContent(this.request.body.content);
  this.type = 'application/pdf';
  this.body = yield page.pdf({ format: 'A4' });
  page.close();
  refCount--;
});


app.listen(process.env.PORT || 3000);
