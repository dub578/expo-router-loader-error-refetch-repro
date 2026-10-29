# expo-router: a failed loader is fetched twice on Retry or revisit

Minimal repro. `app/r/fail.tsx` has a `loader` that always throws and an
`ErrorBoundary` with a Retry button and a link back to `/r/start`.
`count.mjs` counts `/_expo/loaders/` fetches in the page for each Retry and
each revisit. Expected 1 each; actual is 1 or 2, varying run to run.

```sh
npm ci
npx playwright install chromium   # once, if Chromium is not installed
npm run export                    # expo export --platform web --clear
npm run serve                     # expo serve --port 8091 (leave running)
RUNS=8 npm run count              # in a second terminal
```

Example output (expo 58.0.21, expo-router 58.0.28):

```
{"retry":[1,1,1,2,1,1,1,1],"revisit":[1,1,2,2,2,1,2,2]}
expected: 1 request for every Retry and every revisit
```
