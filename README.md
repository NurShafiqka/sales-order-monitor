# Sales Order Monitor

A web app for monitoring sales orders across branches. It has a dashboard, a searchable order list and order details, using live data from the mock API.

**Live app:** https://sales-order-monitor.vercel.app/

## How to run

Requires Node.js 22+.

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/NurShafiqka/sales-order-monitor.git
   cd sales-order-monitor
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```bash
   API_BASE_URL=https://hiring.harrisons.my/api/mock/sales-orders
   API_KEY=hssb-assessment-mock-2026
   ```

3. Start the app, then open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Other commands

```bash
npm test         # run the tests
npm run build    # production build
npm start        # run the production build
```

## AI use

I used **Claude** as a pair-programming assistant. It helped me write the TypeScript code and the Vitest tests from my instructions, and I reviewed each change before comitting.
