import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { authRouter } from "./app/modules/auth/auth.routes";
import { blogRouter } from "./app/modules/blog/blog.router";
import { userRouter } from "./app/modules/user/user.routes";
import _env from "./config";

const app: Application = express();

// Middleware

app.use(
  cors({
    origin: _env.client_url,
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/auth", authRouter);

// Default route for testing
app.get("/", (_req, res) => {
  res.send({
    message: "Server is running..",
    environment: _env.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
