import { depositSchema } from "../config/zodSchemas";
import AccountModel from "../models/AccountModel";
import { DepositInput, DepositOutput } from "../types/AccountTypes";

import {
  FailInService,
  ServiceOutput,
  SuccessfulInService,
} from "../types/ServerTypes";
import { AccountForTransfer, TransferOutput } from "../types/TransactionTypes";

class AccountService {
  private accountModel;

  constructor() {
    this.accountModel = new AccountModel();
  }

  async getAccountDetails(username: string) {
    const accountDetails = await this.accountModel.getAccountDetails(username);

    if (!accountDetails) {
      return {
        fail: {
          message: "404|Account not found",
        },
      } as ServiceOutput<undefined, FailInService>;
    }

    return {
      success: {
        data: accountDetails,
      },
    } as ServiceOutput<SuccessfulInService, undefined>;
  }

  async getAccountIdsToTransfer({
    creditedAccount,
    debitedAccount,
  }: AccountForTransfer) {
    const creditedAcc = await this.accountModel.getAccountDetails(
      creditedAccount
    );
    const debitedAcc = await this.accountModel.getAccountDetails(
      debitedAccount
    );

    if (!debitedAcc && !creditedAcc) {
      return {
        fail: {
          message: "404|Debit and credit account not found",
        },
      } as ServiceOutput<undefined, FailInService>;
    } else if (!debitedAcc) {
      return {
        fail: { message: "404|Debit account not found" },
      } as ServiceOutput<undefined, FailInService>;
    } else if (!creditedAcc) {
      return {
        fail: { message: "404|Credit account not found" },
      } as ServiceOutput<undefined, FailInService>;
    }

    return {
      success: {
        data: {
          debitedAccountId: debitedAcc?.id,
          creditedAccountId: creditedAcc?.id,
        },
      },
    } as ServiceOutput<SuccessfulInService, undefined>;
  }

  async validateBalance(accountId: number, transferAmount: number) {
    const balanceValue = await this.accountModel.getBalance(accountId);
    const canTransfer = transferAmount <= balanceValue;

    if (!canTransfer) {
      return {
        fail: { message: "409|Insufficient balance" },
      } as ServiceOutput<undefined, FailInService>;
    }

    return { success: { data: balanceValue } } as ServiceOutput<
      SuccessfulInService | undefined
    >;
  }

  async makeDeposit({ accountId, value }: DepositInput) {
    const responseValidate = this.validateData(value);

    if (responseValidate.fail) return responseValidate;

    const balanceAfterDeposit = await this.accountModel.makeDeposit({
      value,
      accountId,
    });

    return {
      success: {
        data: balanceAfterDeposit,
      },
    } as ServiceOutput<SuccessfulInService, undefined>;
  }

  async makeTransfer(data: TransferOutput) {
    await this.accountModel.makeTransfer(data);
  }

  validateData(amount: number) {
    const parsedDeposit = depositSchema.safeParse({ amount });

    if (!parsedDeposit.success) {
      const errors = parsedDeposit.error.issues.map((error) => error.message);
      return {
        fail: { message: `400|${errors}` },
      } as ServiceOutput<undefined, FailInService>;
    }

    return {
      success: {
        data: true,
      },
    } as ServiceOutput<SuccessfulInService, undefined>;
  }
}

export default AccountService;
