# Pinnned

**Pinnned** — 친구들과 팟을 만들어 여행 기록으로 우리만의 지도를 채우는 여행 기록 서비스.
https://www.pinnned.co.kr

TanStack Start(SSR) · React 19 · TypeScript · Tailwind 4 · shadcn/ui

## Analytics

Set `VITE_ANALYTICS_API_URL` to the Analytics server origin before running the
web app:

```bash
VITE_ANALYTICS_API_URL=https://pinnned-analytics-production.up.railway.app
```

The web app sends `page_view`, `session_started`, `login_completed`,
`pot_created`, `pot_joined`, `travel_record_created`, `map_viewed`, and
`travel_album_viewed` events to `/api/events`. Analytics requests are
fire-and-forget and failures do not affect product flows.

Google Analytics (`G-0D3HZ92ZME`) loads in production builds only. Enable
**Enhanced measurement → Page views → Page changes based on browser history
events** in the GA web data stream to measure SPA navigation. GA page views use
automatic measurement; the existing `/api/events` analytics remains separate.
GA initializes after hydration and waits until the login callback has completed
to avoid collecting its one-time code. Referrers are reduced to their origin.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
