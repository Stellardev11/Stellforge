import { Transaction, TransactionBuilder, Horizon } from '@stellar/stellar-sdk';
import { getServer, getNetworkPassphrase } from '../utils/stellar';

interface TransactionResult {
  hash: string;
  ledger: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed' | 'not_found';
  ledger?: number;
  createdAt?: string;
  resultXdr?: string;
  errorMessage?: string;
}

export const submitSignedTransaction = async (xdr: string): Promise<TransactionResult> => {
  try {
    const server = getServer();
    const transaction = TransactionBuilder.fromXDR(xdr, getNetworkPassphrase());

    const response = await server.submitTransaction(transaction as Transaction);

    return {
      hash: response.hash,
      ledger: response.ledger,
      status: 'success'
    };
  } catch (error: any) {
    console.error('Error submitting transaction:', error);

    let errorMessage = 'Failed to submit transaction';
    
    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMessage = `Transaction failed: ${codes.transaction || 'unknown error'}`;
      
      if (codes.operations) {
        errorMessage += ` | Operations: ${codes.operations.join(', ')}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const getTransactionStatus = async (hash: string): Promise<TransactionStatus> => {
  try {
    const server = getServer();
    
    const transaction = await server.transactions().transaction(hash).call();

    return {
      hash: transaction.hash,
      status: transaction.successful ? 'success' : 'failed',
      ledger: transaction.ledger_attr as number,
      createdAt: transaction.created_at,
      resultXdr: transaction.result_xdr
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        hash,
        status: 'not_found'
      };
    }

    console.error('Error fetching transaction status:', error);
    return {
      hash,
      status: 'pending'
    };
  }
};

export const validateTransaction = async (xdr: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const transaction = TransactionBuilder.fromXDR(xdr, getNetworkPassphrase());

    if (!(transaction instanceof Transaction)) {
      return {
        valid: false,
        error: 'Invalid transaction XDR'
      };
    }

    const server = getServer();
    const sourceAccount = await server.loadAccount(transaction.source);

    if (!sourceAccount) {
      return {
        valid: false,
        error: 'Source account not found'
      };
    }

    if (transaction.sequence !== (BigInt(sourceAccount.sequence) + BigInt(1)).toString()) {
      return {
        valid: false,
        error: 'Invalid sequence number'
      };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('Error validating transaction:', error);
    return {
      valid: false,
      error: error.message || 'Transaction validation failed'
    };
  }
};

export const pollTransactionStatus = async (
  hash: string,
  maxAttempts: number = 10,
  intervalMs: number = 2000
): Promise<TransactionStatus> => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTransactionStatus(hash);
    
    if (status.status === 'success' || status.status === 'failed') {
      return status;
    }

    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  return {
    hash,
    status: 'pending',
    errorMessage: 'Transaction confirmation timeout'
  };
};

export const estimateTransactionFee = async (operationCount: number = 1): Promise<string> => {
  try {
    const server = getServer();
    const feeStats = await server.feeStats();
    
    const baseFee = Math.max(
      parseInt(feeStats.fee_charged.mode),
      parseInt(feeStats.fee_charged.p50)
    );

    const totalFee = baseFee * operationCount;
    
    return totalFee.toString();
  } catch (error) {
    console.error('Error estimating fee:', error);
    return (100 * operationCount).toString();
  }
};
