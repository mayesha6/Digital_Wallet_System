/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import app from "./app";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("connected to DB.");
    server = app.listen(envVars.PORT, () => {
      console.log(`server is listening to http://localhost:${envVars.PORT}/`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async ()=>{
  await startServer()
})()


process.on("SIGTERM", () => {
  console.log(
    `SIGTERM signal received... Server is shutting down...`
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log(
    `SIGINT signal received... Server is shutting down...`
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.log(
    `Unhandled Rejection detected... Server is shutting down... ${err}`
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.log(
    `Uncaught Exception detected... Server is shutting down... ${err}`
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
