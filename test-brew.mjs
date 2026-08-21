import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'C:\\Users\\Lewis\\AppData\\Local\\Temp\\opencode\\brewtest';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Go to Home, then start brewing
async function clickByText(re) {
  const el = page.getByRole('button', { name: re }).first();
  await el.waitFor({ state: 'visible', timeout: 8000 });
  await el.click();
}

// Default language is 'zh' -> "即刻開始沖煮"
await clickByText(/開始沖煮|Start Brewing/i);
await page.waitForTimeout(1200);
// Prep screen: check all items so the brew button enables
await clickByText(/全部完成|Check All/i);
await page.waitForTimeout(600);
// Prep screen -> start brew timer
await clickByText(/進入沖煮計時|Start Brewing Timer/i);
await page.waitForTimeout(1500);

await page.screenshot({ path: `${OUT}/brew-default.png` });
console.log('saved brew-default.png (env=0)');

// Simulate iOS Dynamic Island safe area (~59px top)
await page.evaluate(() => {
  document.querySelectorAll('*').forEach(el => {
    const pt = el.style.paddingTop || '';
    if (pt.includes('safe-area-inset-top')) {
      el.style.paddingTop = 'calc(59px + 0.5rem)';
    }
  });
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/brew-ios.png` });
console.log('saved brew-ios.png (simulated 59px)');

// Also capture Home to verify global safe-area
await page.evaluate(() => { window.history.length; });
await browser.close();
console.log('DONE');
