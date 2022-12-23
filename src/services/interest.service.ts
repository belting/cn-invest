import { dataSource } from "../database";
import { Statement } from "../entities/statement.entity";
import { AccountTransaction } from "../entities/account-transaction.entity";
import { MoreThanOrEqual } from "typeorm";
import { Decimal } from "decimal.js";
import { getAccount } from "./account.service";

const ANNUAL_INTEREST_RATE = new Decimal("0.02");
const DAYS_PER_YEAR = 365;
const DAILY_INTEREST_RATE = ANNUAL_INTEREST_RATE.dividedBy(DAYS_PER_YEAR);
const DISPLAY_DECIMAL_PLACES = 2;
const ZERO = new Decimal("0");

const getDaysInMonth = (datetime: Date): number => {
  const year = datetime.getUTCFullYear();
  const month = datetime.getUTCMonth() + 1;

  // The day 0 is the last day of the previous month
  return new Date(year, month, 0).getUTCDate();
};

const getLatestStatementAndTransactions = async (
  userId: string
): Promise<{
  statement: Statement;
  accountTransactions: AccountTransaction[];
}> => {
  const account = await getAccount(userId);

  return dataSource.transaction(async (transactionEntityManager) => {
    const statement = await transactionEntityManager.findOne(Statement, {
      where: {
        account,
      },
      order: { datetime: "desc" },
    });

    if (!statement) {
      throw new Error("Account has no statements");
    }

    const accountTransactions = await transactionEntityManager.findBy(
      AccountTransaction,
      {
        account,
        datetime: MoreThanOrEqual(statement.datetime),
      }
    );

    return {
      statement,
      accountTransactions,
    };
  });
};

const calculateInterest = (balance: Decimal, days: number): Decimal =>
  balance.times(days).times(DAILY_INTEREST_RATE);

/**
 * Calculates the given user's interest accrued for the latest month. The latest statement is pulled along with all
 * transactions following it. The interest is then calculated based on the varying balance throughout the month.
 */
export const calculateInterestAccrued = async (
  userId: string
): Promise<string> => {
  const { statement, accountTransactions } =
    await getLatestStatementAndTransactions(userId);

  let interest = ZERO;
  let balance = new Decimal(statement.balance);
  let day = statement.datetime.getUTCDate();

  for (const transaction of accountTransactions) {
    const transactionDay = transaction.datetime.getUTCDate();
    if (transactionDay > day) {
      interest = interest.plus(
        calculateInterest(balance, transactionDay - day)
      );
    }
    day = transactionDay;
    balance = balance.plus(transaction.amount);
  }

  const daysInMonth = getDaysInMonth(statement.datetime);
  interest = interest.plus(calculateInterest(balance, daysInMonth - day + 1));

  return interest.toFixed(DISPLAY_DECIMAL_PLACES);
};
