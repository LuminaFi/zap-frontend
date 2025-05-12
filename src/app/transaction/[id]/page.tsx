"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileLayout } from '../../components/MobileLayout';
import { FiArrowLeft, FiArrowUpRight, FiArrowDownLeft, FiExternalLink } from 'react-icons/fi';
import { Button } from '../../components/Button';

interface TransactionDetails {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInEther?: string;
  timestamp: string | number;
  formattedDate?: string;
  status?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber: number;
  token: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userAddress = '0x85E0FE0Ef81608A6C266373fC8A3B91dF622AF7a';
  
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://zap-service-jkce.onrender.com/api/transaction/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transaction');
        }
        
        setTransaction(data.transaction);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to load transaction details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [params.id]);
  
  const formatDateTime = (dateString?: string | number) => {
    if (!dateString) return '';
    
    try {
      const date = typeof dateString === 'number' 
        ? new Date(dateString * 1000)
        : new Date(dateString);
      
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return String(dateString);
    }
  };
  
  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };
  
  const isSent = transaction?.from?.toLowerCase() === userAddress.toLowerCase();
    const handleBack = () => {
    router.back();
  };
    const openExplorer = () => {
    window.open(`https://etherscan.io/tx/${transaction?.hash}`, '_blank');
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
            <p>{error}</p>
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
                {isSent ? '- ' : '+ '}{transaction.valueInEther || transaction.value}
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
                    {transaction.from.toLowerCase() === userAddress.toLowerCase() && '(You)'}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">To</div>
                <div className="detail-value address">
                  {transaction.to}
                  <span className="address-label">
                    {transaction.to.toLowerCase() === userAddress.toLowerCase() && '(You)'}
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
                onClick={openExplorer}
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