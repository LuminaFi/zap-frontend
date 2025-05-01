"use client";

import React from 'react';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';

interface TransactionProps {
  txAddress: string;
  token: string;
  amount: string | number;
  type?: 'sent' | 'received';
  date?: string;
}

export const Transaction: React.FC<TransactionProps> = ({
  txAddress,
  token,
  amount,
  type = 'sent',
  date
}) => {
  const isReceived = type === 'received';
  
  return (
    <div className={`transaction-item ${isReceived ? 'transaction-item--received' : 'transaction-item--sent'}`}>
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
            <span className="value">{txAddress}</span>
          </div>
          {date && <div className="transaction-item__date">{date}</div>}
        </div>
        
        <div className="transaction-item__info">
          <div className="transaction-item__token">
            <span className="value">{token}</span>
          </div>
          <div className={`transaction-item__amount ${isReceived ? 'received' : 'sent'}`}>
            <span className="value">{isReceived ? '+' : '-'} {amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 