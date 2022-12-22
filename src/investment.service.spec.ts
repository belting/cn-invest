import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";
import {
  calculateInterestAccrued,
  createAccount,
  deposit,
  withdraw,
} from "./investment.service";
import { connect, disconnect } from "./database";

const createDate = (month: number, day: number): Date =>
  new Date(Date.UTC(2023, month - 1, day));

const generateUserId = (): string => uuidv4();

describe("Investment Service", () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterAll(async () => {
    await disconnect();
  });

  describe("calculateInterestAccrued", () => {
    it("should calculate the interest accrued for case 1", async () => {
      const userId = generateUserId();
      await createAccount(userId, createDate(1, 1));
      await deposit(userId, "10000", createDate(1, 1));

      const interestAccrued = await calculateInterestAccrued(userId);

      expect(interestAccrued).toEqual("16.99");
    });

    it("should calculate the interest accrued for case 2", async () => {
      const userId = generateUserId();
      await createAccount(userId, createDate(1, 1));
      await deposit(userId, "10000", createDate(1, 1));
      await deposit(userId, "5000", createDate(1, 5));

      const interestAccrued = await calculateInterestAccrued(userId);

      expect(interestAccrued).toEqual("24.38");
    });

    it("should calculate the interest accrued for case 3", async () => {
      const userId = generateUserId();
      await createAccount(userId, createDate(1, 1));
      await deposit(userId, "10000", createDate(1, 1));
      await withdraw(userId, "5000", createDate(1, 5));

      const interestAccrued = await calculateInterestAccrued(userId);

      expect(interestAccrued).toEqual("9.59");
    });

    it("should calculate the interest accrued for case 4", async () => {
      const userId = generateUserId();
      await createAccount(userId, createDate(1, 1));
      await deposit(userId, "10000", createDate(1, 1));
      await deposit(userId, "5000", createDate(1, 15));
      await withdraw(userId, "5000", createDate(1, 27));

      const interestAccrued = await calculateInterestAccrued(userId);

      expect(interestAccrued).toEqual("20.27");
    });

    it("should calculate the interest accrued for extra case", async () => {
      const userId = generateUserId();
      await createAccount(userId, createDate(1, 1));
      await deposit(userId, "10000", createDate(1, 1));
      await deposit(userId, "5000", createDate(1, 15));
      await withdraw(userId, "5000", createDate(1, 27));
      await deposit(userId, "15000", createDate(1, 31));
      await withdraw(userId, "5000", createDate(1, 31));

      const interestAccrued = await calculateInterestAccrued(userId);

      expect(interestAccrued).toEqual("20.82");
    });
  });
});
