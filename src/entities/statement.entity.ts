import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account.entity";

@Entity()
export class Statement {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({
    type: "decimal",
    precision: 13,
    scale: 4,
  })
  declare balance: string;

  @Column()
  declare datetime: Date;

  @ManyToOne(() => Account, { nullable: false })
  declare account: Account;
}
