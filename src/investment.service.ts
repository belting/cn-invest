import { dataSource } from "./database";
import { Account } from "./entities/account.entity";
import { Statement } from "./entities/statement.entity";
import { AccountTransaction } from "./entities/account-transaction.entity";
import { MoreThanOrEqual } from "typeorm";
import { AccountTransactionType } from "./account-transaction-type";
import { Decimal } from "decimal.js";

const accountRepository = dataSource.getRepository(Account);
const accountTransactionRepository =
  dataSource.getRepository(AccountTransaction);

const ANNUAL_INTEREST_RATE = new Decimal("0.02");
const DAYS_PER_YEAR = 365;
const DAILY_INTEREST_RATE = ANNUAL_INTEREST_RATE.dividedBy(DAYS_PER_YEAR);
const STORAGE_DECIMAL_PLACES = 4;
const DISPLAY_DECIMAL_PLACES = 2;
const ZERO = new Decimal("0");

const getDaysInMonth = (datetime: Date): number => {
  const year = datetime.getUTCFullYear();
  const month = datetime.getUTCMonth() + 1;

  return new Date(year, month, 0).getUTCDate();
};

const getAccount = async (userId: number): Promise<Account> => {
  const account = await accountRepository.findOneBy({
    userId,
  });

  if (!account) {
    throw new Error(`Account for user ID ${userId} not found`);
  }

  return account;
};

const getLatestStatementAndTransactions = async (
  userId: number
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

export const calculateInterestAccrued = async (
  userId: number
): Promise<string> => {
  const { statement, accountTransactions } =
    await getLatestStatementAndTransactions(userId);

  let interestAccrued = ZERO;
  let balance = new Decimal(statement.balance);
  let day = statement.datetime.getUTCDate();

  for (const transaction of accountTransactions) {
    const transactionDay = transaction.datetime.getUTCDate();
    if (transactionDay > day) {
      interestAccrued = interestAccrued.plus(
        calculateInterest(balance, transactionDay - day)
      );
    }
    day = transactionDay;
    balance = balance.plus(transaction.amount);
  }

  const daysInMonth = getDaysInMonth(statement.datetime);
  interestAccrued = interestAccrued.plus(
    calculateInterest(balance, daysInMonth - day + 1)
  );

  return interestAccrued.toFixed(DISPLAY_DECIMAL_PLACES);
};

export const createAccount = async (
  userId: number,
  datetime: Date
): Promise<void> => {
  const account = new Account();
  account.userId = userId;

  const statement = new Statement();
  statement.balance = ZERO.toFixed(STORAGE_DECIMAL_PLACES);
  statement.datetime = datetime;
  statement.account = account;

  await dataSource.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.save(account);
    await transactionalEntityManager.save(statement);
  });
};

const createAccountTransaction = async ({
  userId,
  amount,
  datetime,
  type,
}: {
  userId: number;
  amount: string;
  datetime: Date;
  type: AccountTransactionType;
}): Promise<void> => {
  const account = await getAccount(userId);

  const accountTransaction = new AccountTransaction();
  accountTransaction.type = type;
  accountTransaction.amount = amount;
  accountTransaction.datetime = datetime;
  accountTransaction.account = account;

  await accountTransactionRepository.save(accountTransaction);
};

export const deposit = async (
  userId: number,
  amount: string,
  datetime: Date
): Promise<void> =>
  createAccountTransaction({
    userId,
    amount,
    datetime,
    type: AccountTransactionType.DEPOSIT,
  });

export const withdraw = async (
  userId: number,
  amount: string,
  datetime: Date
): Promise<void> =>
  createAccountTransaction({
    userId,
    amount: new Decimal(amount).negated().toFixed(STORAGE_DECIMAL_PLACES),
    datetime,
    type: AccountTransactionType.WITHDRAWAL,
  });
