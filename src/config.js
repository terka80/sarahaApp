import { resolve } from "node:path";
import { config } from "dotenv";

config({
  path: resolve(`.env.${process.env.NODE_ENV ?? "development"}`)
});

export const PORT = parseInt(process.env.PORT ?? "9000");

export const DB_URI = process.env.DB_URI;
export const ENC_KEY = process.env.ENC_KEY;
export const IV_LENGTH = parseInt(process.env.IV_LENGTH??"16");
