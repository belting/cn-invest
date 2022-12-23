# Investment Coding Challenge

## Getting Started
1. Install [Node.js](https://nodejs.org/) and [Docker](https://docs.docker.com/compose/install/)
2. Run `npm install` to install dependencies
3. Run `docker compose up` to start the MySQL instance
4. Update `DB_HOST` in the `.env` file if needed for your setup
5. Run `npm start` to run test cases

## Code

The `calculateInterestAccrued` function is exported from `src/index.ts` and tested in `src/index.spec.ts`.
To prevent floating point rounding errors, exported functions use strings externally and [Decimal](https://github.com/MikeMcl/decimal.js) internally for monetary values.

## Database Design

This design calls for the creation of a new `statement` record at the end of every month. 
For a given `account`, the statement balance is calculated as the sum of the previous statement balance and the amount of each `account_transaction` occurring after the previous statement.
The current balance may be calculated in the same way at any time throughout the month, but it should not be stored.
All monetary amounts are stored in USD.

### ERD

```mermaid
erDiagram
    account ||--o{ account_transaction : ""
    account ||--o{ statement : ""
    account {
        int id PK
        varchar userId "UUID"
    }
    account_transaction {
        int id PK
        int accountId FK
        enum type "DEPOSIT, WITHDRAWAL"
        datetime datetime
        decimal amount "4 decimal places"
    }
    statement {
        int id PK
        int accountId FK
        datetime datetime
        decimal balance "4 decimal places"
    }
```

### DDL

```sql
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `account_transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `datetime` datetime NOT NULL,
  `amount` decimal(13,4) NOT NULL,
  `type` enum('DEPOSIT','WITHDRAWAL') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_03114b894370038c6294a8a74b9` (`accountId`),
  CONSTRAINT `FK_03114b894370038c6294a8a74b9` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `datetime` datetime NOT NULL,
  `balance` decimal(13,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_38f9391b0bc74a9805bcbb7f362` (`accountId`),
  CONSTRAINT `FK_38f9391b0bc74a9805bcbb7f362` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
