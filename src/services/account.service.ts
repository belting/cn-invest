import { Account } from "../entities/account.entity";
import { AccountTransactionType } from "../enums/account-transaction-type";
import { Decimal } from "decimal.js";
import { AccountTransaction } from "../entities/account-transaction.entity";
import { Statement } from "../entities/statement.entity";
import { dataSource } from "../database";

const STORAGE_DECIMAL_PLACES = 4;
const ZERO = new Decimal("0");

const accountRepository = dataSource.getRepository(Account);
const accountTransactionRepository =
  dataSource.getRepository(AccountTransaction);

const createAccountTransaction = async ({
  userId,
  amount,
  datetime,
  type,
}: {
  userId: string;
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

/**
 * Deposits the given amount into the user's account.
 */
export const deposit = async (
  userId: string,
  amount: string,
  datetime: Date
): Promise<void> =>
  createAccountTransaction({
    userId,
    amount,
    datetime,
    type: AccountTransactionType.DEPOSIT,
  });

/**
 * Withdraws the given amount from the user's account.
 */
export const withdraw = async (
  userId: string,
  amount: string,
  datetime: Date
): Promise<void> =>
  createAccountTransaction({
    userId,
    amount: new Decimal(amount).negated().toFixed(STORAGE_DECIMAL_PLACES),
    datetime,
    type: AccountTransactionType.WITHDRAWAL,
  });

/**
 * Gets the account for the given user.
 */
export const getAccount = async (userId: string): Promise<Account> => {
  const account = await accountRepository.findOneBy({
    userId,
  });

  if (!account) {
    throw new Error(`Account for user ID ${userId} not found`);
  }

  return account;
};

/**
 * Creates an account for the given user. An initial statement with a balance of zero is also created.
 */
export const createAccount = async (
  userId: string,
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
