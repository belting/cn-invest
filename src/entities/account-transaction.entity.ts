import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account.entity";
import { AccountTransactionType } from "../account-transaction-type";

@Entity()
export class AccountTransaction {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "enum", enum: AccountTransactionType })
  declare type: AccountTransactionType;

  @Column({
    type: "decimal",
    precision: 13,
    scale: 4,
  })
  declare amount: string;

  @Column()
  declare datetime: Date;

  @ManyToOne(() => Account, { nullable: false })
  declare account: Account;
}
