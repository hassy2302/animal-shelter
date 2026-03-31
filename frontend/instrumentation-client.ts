import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d8e7a27db580d9d0c05042be98b6580f@o4511137869463552.ingest.us.sentry.io/4511137875296256",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});
