import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
const click = async (re) => { const el = page.getByRole('button', { name: re }).first(); await el.waitFor({ state: 'visible', timeout: 8000 }); await el.click(); };
await click(/開始沖煮|Start Brewing/i);
await page.waitForTimeout(1200);
await click(/全部完成|Check All/i);
await page.waitForTimeout(600);
await click(/進入沖煮計時|Start Brewing Timer/i);
await page.waitForTimeout(1500);

// Measure at env=0
const measure = async (simulate59) => {
  return await page.evaluate((sim) => {
    const allBtns = [...document.querySelectorAll('button')];
    let hdr = null;
    for (const b of allBtns) {
      if (b.innerHTML.includes('ChevronLeft') || b.querySelector('svg.lucide-chevron-left, svg[class*="chevron"]')) {
        let p = b;
        while (p && !(p.className && typeof p.className === 'string' && p.className.includes('shrink-0'))) p = p.parentElement;
        if (p) { hdr = p; break; }
      }
    }
    // brew root = ancestor of header with overflow-hidden
    let root = hdr;
    while (root && !(root.className && typeof root.className === 'string' && root.className.includes('overflow-hidden'))) root = root.parentElement;
    if (sim) root.style.paddingTop = '59px';
    const R = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) }; };
    const out = { viewportH: window.innerHeight, rootPad: root ? getComputedStyle(root).paddingTop : null, header: hdr ? R(hdr) : null, headerStyle: hdr ? hdr.getAttribute('style') : null };
    if (hdr) {
      let sib = hdr.nextElementSibling, scroll = null;
      while (sib) { const oy = getComputedStyle(sib).overflowY; if (oy === 'auto' || oy === 'scroll') { scroll = sib; break; } sib = sib.nextElementSibling; }
      if (scroll) {
        const kids = [...scroll.children];
        out.scrollKids = kids.length;
        if (kids[0]) out.first = { ...R(kids[0]), text: (kids[0].innerText||'').slice(0,24).replace(/\n/g,' ') };
        if (kids[1]) out.second = R(kids[1]);
        let b = scroll.nextElementSibling;
        while (b) { if (b.className && typeof b.className === 'string' && b.className.includes('shrink-0')) { out.bottomControls = R(b); break; } b = b.nextElementSibling; }
      }
    }
    return out;
  }, simulate59);
};

const env0 = await measure(false);
console.log('ENV=0:', JSON.stringify(env0, null, 2));
const ios59 = await measure(true);
console.log('IOS59:', JSON.stringify(ios59, null, 2));

if (ios59.header && ios59.first) {
  console.log('\n[IOS59] header.bottom=', ios59.header.bottom, ' first.top=', ios59.first.top,
    ' => overlap(header vs firstContent):', ios59.first.top < ios59.header.bottom - 1);
}
if (ios59.first && ios59.bottomControls) {
  console.log('[IOS59] first.bottom=', ios59.first.bottom, ' bottomControls.top=', ios59.bottomControls.top,
    ' => overlap(firstContent vs bottomControls):', ios59.first.bottom > ios59.bottomControls.top);
}
if (ios59.second && ios59.bottomControls) {
  console.log('[IOS59] second(timer card).bottom=', ios59.second.bottom, ' bottomControls.top=', ios59.bottomControls.top,
    ' => timer card hidden behind bottom controls:', ios59.second.bottom > ios59.bottomControls.top);
}

await browser.close();
console.log('DONE');
