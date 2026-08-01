// Renderiza cover.html em PNG 1400x1400 (capa do podcast).
//   node shot.js cover.html cover.png
// Requer Playwright disponível (npm i -g playwright, ou NODE_PATH apontando para ele).
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const [input = 'cover.html', output = 'cover.png'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(input));
  await page.screenshot({ path: output });
  await browser.close();
  console.log(output);
})();
