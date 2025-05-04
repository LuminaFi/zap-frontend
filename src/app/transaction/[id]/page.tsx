"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileLayout } from '../../components/MobileLayout';
import { FiArrowLeft, FiArrowUpRight, FiArrowDownLeft, FiExternalLink } from 'react-icons/fi';
import { Button } from '../../components/Button';

// Types for transaction details
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
  
  // Placeholder user address - in a real app, get this from auth context
  const userAddress = '0x85E0FE0Ef81608A6C266373fC8A3B91dF622AF7a';
  
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the direct endpoint to fetch a single transaction by its hash
        const response = await fetch(`https://zap-service-jkce.onrender.com/api/transaction/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transaction');
        }
        
        // Use the transaction directly from the response
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
  
  // Format date and time from ISO string or timestamp
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
  
  // Truncate Ethereum address for display
  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };
  
  // Determine if transaction is sent or received
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
          <div className="transaction-detail-loading">
            <p>Loading transaction details...</p>
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