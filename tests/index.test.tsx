import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';

const EXTENSION_PATH = path.resolve('dist');
const TEST_URL = `https://github.com/Vinicius-resende-cin/semantic-conflict/pull/192`;

let browser: Browser;
let page: Page;

beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`
      ]
    });

    const pages = await browser.pages();
    page = pages[0] || (await browser.newPage());

  });
  
  afterAll(async () => {
    if (browser) {
        await browser.close();
    }
});

test('checking dependendies tag', async () => {
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

  const element = await page.waitForSelector('a.tabnav-tab.flex-shrink-0[href="#dependencies"]', { timeout: 20000 });

  if (element){
    console.log('Tag Founded!');
  } else {
    console.error('Tag was not founded.');
  }
    
}, 30000);

test('checking log dependencies content', async () => {
  await page.click('a.tabnav-tab.flex-shrink-0[href="#dependencies"]');

  const element = await page.waitForSelector('div#dependency-container', { timeout: 20000 });

  if (element){
    console.log('Log Founded!');
  } else {
    console.error('Log was not founded.');
  }   
  
}, 30000);

test('checking diff dependencies content', async () => {
  const element = await page.waitForSelector('div#diff-container', { timeout: 20000 });

  if (element){
    console.log('Diff container Founded!');
  } else {
    console.error('Diff container was not founded.');
  }   
  
}, 30000);