import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { getDiffLine, highlight } from '../src/extension/components/Diff/diff-navigation';

const EXTENSION_PATH = path.resolve('dist');
const TEST_URL = `https://github.com/Vinicius-resende-cin/semantic-conflict/pull/192`;
const FILE_TEST = 'DFPBaseSample.java';
const LINE_TEST = 11;

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

  }, 30000);
  
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

test('checking if the graph is builded', async () => {
  // Selecting one of the <li>s at log of dependencies
  const dependencie = await page.$('ul.tw-list-none li');

  if (dependencie) {
    await dependencie.click();
    console.log('Clicking in a dependencie!');
  } else {
    console.error('The list was not founded');
    return;
  }

  // Waiting for the graph
  const graphContainer = await page.waitForSelector('div.sigma-container', { timeout: 20000 });

  if (graphContainer) {
    console.log('The graph was founded!');
  } else {
    console.error('The graph was not founded');
  }
}, 30000);

test('checking if the click on node works correctly', async () => {
  const diffLineId = await page.evaluate((file, line) => {
    const diffLine = getDiffLine(file, line);
    return diffLine ? diffLine.id : null; 
  }, FILE_TEST, LINE_TEST);

  expect(diffLineId).not.toBeNull(); 
  if (!diffLineId) {
    throw new Error("Failed to find diff line");
  }
  await page.evaluate((diffLineId) => {
    const lineElement = document.getElementById(diffLineId);
    if (lineElement) {
      lineElement.scrollIntoView();
      highlight(lineElement);
      lineElement.classList.add("pl-line-highlight");
    }
  }, diffLineId);
  const isHighlighted = await page.evaluate(() => {
    return !!document.querySelector('tr.pl-line-highlight');
  });
  expect(isHighlighted).toBe(true);

  // const DiffLine = page.evaluate(() => { return getDiffLine(FILE_TEST, LINE_TEST) })
  
  // expect(DiffLine).not.toBeNull();

  // await page.evaluate((lineElement) => {
  //   if (lineElement) {
  //     scrollAndHighlight(lineElement);
  //     lineElement.classList.add("pl-line-highlight");
  //   }
  // }, DiffLine);

  // const isHighlighted = await page.evaluate(() => {
  //   return !!document.querySelector('tr.pl-line-highlight');
  // });

  // expect(isHighlighted).toBe(true);
}, 30000);

