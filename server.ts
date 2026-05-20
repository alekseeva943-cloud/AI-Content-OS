import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import plannerRouter from "./src/server/routes/planner.ts";
import newsletterRouter from "./src/server/routes/newsletter.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log(
    `[Request] ${new Date().toISOString()} ${req.method} ${req.url}`
  );

  next();
});

app.use(cors());

app.use(express.json({
  limit: "20mb"
}));

// Route registration
app.use(plannerRouter);
app.use(newsletterRouter);

app.all("/api/*", (req, res) => {
  res.status(404).json({
    error:
      "API Endpoint not found",

    received: {
      method: req.method,
      path: req.url
    }
  });
});

async function startServer() {
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true
        },

        appType: "spa"
      });

    app.use(vite.middlewares);

  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(distPath)
    );

    app.get("*", (req, res) => {
      res.sendFile(
        path.join(
          distPath,
          "index.html"
        )
      );
    });
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `[Server] Running on ${PORT}`
      );
    }
  );
}

startServer();
