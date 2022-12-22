import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account.entity";
import { AccountTransactionType } from "../account-transaction-type";

@Entity()
export class AccountTransaction {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare type: AccountTransactionType;

  @Column({
    type: "decimal",
    precision: 13,
    scale: 4,
  })
  declare amount: string;

  @Column()
  declare datetime: Date;

  @ManyToOne(() => Account)
  declare account: Account;
}
