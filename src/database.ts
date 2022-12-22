import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { Account } from "./entities/account.entity";
import { AccountTransaction } from "./entities/account-transaction.entity";
import { Statement } from "./entities/statement.entity";

export const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Account, AccountTransaction, Statement],
  logging: "all",
});

export const connect = async () => {
  try {
    await dataSource.initialize();
    console.log("Connected to database");
  } catch (err: unknown) {
    console.error(err);
  }
};

export const disconnect = async () => {
  try {
    await dataSource.destroy();
    console.log("Disconnected from database");
  } catch (err: unknown) {
    console.error(err);
  }
};
