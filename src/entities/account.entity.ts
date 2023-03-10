import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AccountTransaction } from "./account-transaction.entity";
import { Statement } from "./statement.entity";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "varchar", length: 36 })
  declare userId: string;

  @OneToMany(
    () => AccountTransaction,
    (accountTransaction) => accountTransaction.account
  )
  declare accountTransactions: AccountTransaction[];

  @OneToMany(() => Statement, (statement) => statement.account)
  declare statements: Statement[];
}
