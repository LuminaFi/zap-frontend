"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';

interface TransactionProps {
  txAddress: string;
  token: string;
  amount: string | number;
  type?: 'sent' | 'received';
  date?: string;
  id?: string; // Added ID for navigation
}

export const Transaction: React.FC<TransactionProps> = ({
  txAddress,
  token,
  amount,
  type = 'sent',
  date,
  id
}) => {
  const router = useRouter();
  const isReceived = type === 'received';
  
  // Truncate Ethereum address to format: 0x123...ABC
  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format date and time from ISO string or timestamp
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Format: DD/MM/YYYY HH:MM
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      // Return the original string if date parsing fails
      return dateString;
    }
  };
  
  // Handle click to navigate to transaction details
  const handleClick = () => {
    if (id) {
      router.push(`/transaction/${id}`);
    }
  };
  
  return (
    <div 
      className={`transaction-item ${isReceived ? 'transaction-item--received' : 'transaction-item--sent'}`}
      onClick={handleClick}
      style={{ cursor: id ? 'pointer' : 'default' }}
    >
      <div className="transaction-item__icon">
        {isReceived ? (
          <div className="icon-circle received">
            <FiArrowDownLeft />
          </div>
        ) : (
          <div className="icon-circle sent">
            <FiArrowUpRight />
          </div>
        )}
      </div>
      
      <div className="transaction-item__details">
        <div className="transaction-item__main">
          <div className="transaction-item__address">
            <span className="value">{truncateAddress(txAddress)}</span>
          </div>
          {date && <div className="transaction-item__date">{formatDateTime(date)}</div>}
        </div>
        
        <div className="transaction-item__info">
          <div className="transaction-item__token">
            <span className="value">{token}</span>
          </div>
          <div className={`transaction-item__amount ${isReceived ? 'received' : 'sent'}`}>
            <span className="value">{isReceived ? '+ ' : '- '}{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 