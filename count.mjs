// Counts /_expo/loaders/ fetches for a Retry and a revisit of a route whose
// loader throws. Run against `npm run serve` after `npm run export`.
// Fetches are counted in the page by a fetch wrapper and read after the
// error UI is on screen: every render attempt has sent its fetch by then.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://127.0.0.1:8091";
const RUNS = Number(process.env.RUNS ?? 5);

const COUNT_FETCHES = () => {
  window.__loaderFetches = [];
  const real = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("/_expo/loaders/")) window.__loaderFetches.push(url);
    return real.call(this, input, init);
  };
};

const fetches = (page) => page.evaluate(() => window.__loaderFetches.length);

/** The boundary's mount number, from "route boundary #N: ...". */
const mountNumber = async (page) =>
  Number(/#(\d+)/.exec(await page.getByTestId("error").textContent())[1]);

const browser = await chromium.launch();
try {
  const out = { retry: [], revisit: [] };
  for (let i = 0; i < RUNS; i++) {
    const page = await browser.newPage();
    await page.addInitScript(COUNT_FETCHES);
    await page.goto(`${BASE}/r/start`);
    await page.waitForSelector("html[data-hydrated='1']", { state: "attached" });

    // First failure.
    await page.getByTestId("to-fail").click();
    await page.getByTestId("error").waitFor();

    // Retry: wait for the boundary to mount again with the retry's own error.
    // (The number can skip: React may run the state initializer of a render
    // it throws away. Only "a later mount" matters.)
    const beforeRetry = await fetches(page);
    const mount = await mountNumber(page);
    await page.getByTestId("retry").click();
    await page.waitForFunction((prev) => {
      const el = document.querySelector('[data-testid="error"]');
      const m = el && /#(\d+)/.exec(el.textContent);
      return m && Number(m[1]) > prev;
    }, mount);
    out.retry.push((await fetches(page)) - beforeRetry);

    // Revisit: leave for /r/start, then click through to /r/fail again.
    await page.getByTestId("back").click();
    await page.getByTestId("to-fail").waitFor();
    const beforeRevisit = await fetches(page);
    await page.getByTestId("to-fail").click();
    await page.getByTestId("error").waitFor();
    out.revisit.push((await fetches(page)) - beforeRevisit);
    await page.close();
  }
  console.log(JSON.stringify(out));
  console.log("expected: 1 request for every Retry and every revisit");
} finally {
  await browser.close();
}
