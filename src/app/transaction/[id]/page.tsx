"use client";

import { useParams, useRouter } from 'next/navigation';
import { MobileLayout } from '@/components/MobileLayout';
import { FiArrowLeft, FiArrowUpRight, FiArrowDownLeft, FiExternalLink } from 'react-icons/fi';
import { Button } from '@/components/Button';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { getTransactionDetail } from './apiRequest';
import { formatDateTime } from '@/utils/formatDateTime';
import { truncateAddress } from '@/utils/truncateAddress';
import { getTransactionFormattedAmount } from '@/utils/getTransactionFormattedAmount';
import { TransactionDetails } from './types';
import { openTransactionInExplorer } from '@/utils/openTransactionInExplorer';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address: userAddress } = useAccount();

  const {
    data: transaction,
    isLoading: isLoading,
    error
  } = useQuery<TransactionDetails>({
    queryKey: [`fetch-transaction-detail`],
    queryFn: () => getTransactionDetail(params)
  });

  const isSent = transaction?.from?.toLowerCase() === userAddress?.toLowerCase();

  const handleBack = () => {
    router.back();
  };

  return (
    <MobileLayout title="Transaction Details" showAvatar={false}>
      <div className="transaction-detail-container">
        <div className="transaction-detail-header">
          <div className="back-link" onClick={handleBack}>
            <FiArrowLeft /> <span>Back</span>
          </div>
          <h1 className="detail-title">Transaction Details</h1>
        </div>

        {isLoading ? (
          <div className="transaction-detail-content">
            <div className="shimmer-card" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div className="shimmer" style={{ height: '60px', width: '60px', borderRadius: '50%', margin: '0 auto 12px auto' }}></div>
              <div className="shimmer" style={{ height: '24px', width: '180px', margin: '0 auto 16px auto' }}></div>
              <div className="shimmer" style={{ height: '32px', width: '150px', margin: '0 auto 10px auto' }}></div>
              <div className="shimmer" style={{ height: '16px', width: '120px', margin: '0 auto' }}></div>
            </div>

            <div className="shimmer-card" style={{ borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div className="shimmer" style={{ height: '20px', width: '100%', marginBottom: '16px' }}></div>
              <div className="shimmer" style={{ height: '20px', width: '100%', marginBottom: '16px' }}></div>
              <div className="shimmer" style={{ height: '20px', width: '100%', marginBottom: '16px' }}></div>
              <div className="shimmer" style={{ height: '20px', width: '60%', marginBottom: '16px' }}></div>
              <div className="shimmer" style={{ height: '20px', width: '80%' }}></div>
            </div>

            <div className="shimmer" style={{ height: '48px', width: '100%', borderRadius: '12px' }}></div>
          </div>
        ) : error ? (
          <div className="transaction-detail-error">
            <p>{error.message}</p>
            <Button variant="primary" onClick={handleBack}>Return to Transactions</Button>
          </div>
        ) : transaction ? (
          <div className="transaction-detail-content">
            <div className="transaction-type-banner">
              <div className={`transaction-icon ${isSent ? 'sent' : 'received'}`}>
                {isSent ? <FiArrowUpRight /> : <FiArrowDownLeft />}
              </div>
              <h2 className="transaction-type">
                {isSent ? 'Sent' : 'Received'} {transaction.token || 'IDRX'}
              </h2>
              <div className={`transaction-amount ${isSent ? 'sent' : 'received'}`}>
                {isSent ? '- ' : '+ '}{getTransactionFormattedAmount(transaction)}
              </div>
              <div className="transaction-date">
                {formatDateTime(transaction.timestamp)}
              </div>
            </div>

            <div className="transaction-detail-section">
              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className={`detail-value status ${transaction.status || 'success'}`}>
                  {transaction.status || 'Success'}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">From</div>
                <div className="detail-value address">
                  {transaction.from}
                  <span className="address-label">
                    {transaction.from.toLowerCase() === userAddress?.toLowerCase() && '(You)'}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">To</div>
                <div className="detail-value address">
                  {transaction.to}
                  <span className="address-label">
                    {transaction.to.toLowerCase() === userAddress?.toLowerCase() && '(You)'}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Block</div>
                <div className="detail-value">{transaction.blockNumber}</div>
              </div>

              {transaction.gasUsed && (
                <div className="detail-row">
                  <div className="detail-label">Gas Used</div>
                  <div className="detail-value">{transaction.gasUsed}</div>
                </div>
              )}

              <div className="detail-row">
                <div className="detail-label">Transaction Hash</div>
                <div className="detail-value hash">
                  {truncateAddress(transaction.hash)}
                </div>
              </div>
            </div>

            <div className="transaction-action">
              <Button
                variant="outline"
                className="explorer-button"
                onClick={() => openTransactionInExplorer(transaction)}
                fullWidth
              >
                View on Explorer <FiExternalLink />
              </Button>
            </div>
          </div>
        ) : (
          <div className="transaction-detail-error">
            <p>Transaction not found</p>
            <Button variant="primary" onClick={handleBack}>Return to Transactions</Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
} 