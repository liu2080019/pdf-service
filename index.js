/**
 * Created by fed on 2017/9/1.
 */
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');
const koa = require('koa');
const bodyParser = require('koa-body');
const puppeteer = require('puppeteer');

const router = require('koa-router')();
const app = koa();
const read = require('util').promisify(fs.readFile);
const write = require('util').promisify(fs.writeFile);

let refCount = 0;
let browser = null;

const defaultContent = fs.readFileSync(path.join(__dirname, 'default.html'), 'utf8');
const errorContent = fs.readFileSync(path.join(__dirname, 'error.html'), 'utf8');
const cacheDir = path.join(__dirname, 'cache');

function cacheIdGenerator(content) {
  return Date.now() + '-' + content.length + '.html';
}

function getBrowser() {
  if (!browser) {
    return puppeteer.launch({ args: ['--no-sandbox'] }).then(br => {
      browser = br;
      return br;
    });
  }
  return Promise.resolve(browser);
}

getBrowser();
// setInterval(() => {
//   if (refCount === 0) {
//     browser.close();
//     browser = null;
//   }
// }, 10 * 60 * 1000);

app.use(bodyParser({
  multipart: true,
}));

function* render(content, options = {}) {
  const browser = yield getBrowser();
  const page = yield browser.newPage();
  refCount++;
  yield page.goto('about:blank');
  yield Promise.all([page.setContent(content), page.waitForNavigation({ waitUntil: 'load' })]);
  this.type = 'application/pdf';
  this.body = yield page.pdf({ format: 'A4', landscape: !!options.landscape });
  page.close();
  refCount--;
}

router.post('/', function *(next) {
  const { no_redirect, landscape } = this.request.query;
  const content = this.request.body.content || this.request.body.fields ? this.request.body.fields.content: defaultContent;
  if (no_redirect) {
    yield* render.call(this, content);
    return;
  }
  render.call(this, content)
  const id = cacheIdGenerator(content);
  yield write(path.join(cacheDir, id), content);
  this.redirect('/cache?' + querystring.stringify({
      id,
      landscape,
    }));
}).get('/', function *(next) {
  yield* render.call(this, defaultContent);
}).get('/cache', function* (next) {
  const { id, landscape } = this.request.query;
  let content;
  try {
    content = yield read(path.join(cacheDir, id), 'utf8');
  } catch (e) {
    content = errorContent;
  }
  yield* render.call(this, content, { landscape });
});


app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(process.env.PORT || 3000);
