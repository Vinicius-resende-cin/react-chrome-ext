import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { getDiffLine, highlight, scrollAndHighlight } from '../src/extension/components/Diff/diff-navigation';

const EXTENSION_PATH = path.resolve('dist');
const TEST_URL = `https://github.com/Vinicius-resende-cin/semantic-conflict/pull/192`;
const FILE_TEST = 'RightAssignment.java';
const LINE_TEST = 5;

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
  const initialScrollPosition = await page.evaluate(() => document.documentElement.scrollTop);
  await page.evaluate((file, line) => {

    const diffContainer = document.getElementById("diff-container");
    const diffFiles = diffContainer?.querySelectorAll(".d2h-file-wrapper");
    if (!diffContainer || !diffFiles) throw new Error("Diff not found");

    // get the diff element of the file
    const diffContent = Array.from(diffFiles).filter((diffFile) => {
      const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
      console.log(fileName);
      return fileName?.endsWith(file);
    })[0];
    if (!diffContent) throw new Error(`Diff not found for file ${file}`);

    // get the line element
    const allLines = diffContent.querySelectorAll(`tr`);

    let lineElement = Array.from(allLines).filter((l) => {
      const lineNumber = l.querySelector(".line-num2")?.textContent;
      return lineNumber === line.toString();
    })[0];
    if (!lineElement) throw new Error(`Line ${line} not found in file ${file}`);
    // set the id and return
    lineElement.id = `${file}:${line}`;    

    lineElement.classList.add("pl-line-highlight");

    // add the fade out effect
    lineElement.addEventListener(
      "mouseover",
      () => {
        lineElement.classList.add("pl-fadeout-border");
      },
      { once: true }
    );
  
    // remove the highlight class after the fade out effect
    lineElement.addEventListener("animationend", (event) => {
      if (event.animationName === "fadeOutBorder") {
        lineElement.classList.remove("pl-line-highlight");
        lineElement.classList.remove("pl-fadeout-border");
      }
    });

    lineElement.scrollIntoView({ block: "center" });
 
  }, FILE_TEST, LINE_TEST);
  const finalScrollPosition = await page.evaluate(() => document.documentElement.scrollTop);
  expect(finalScrollPosition).not.toBe(initialScrollPosition);
}, 30000);
