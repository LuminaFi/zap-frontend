"use client";

import React from 'react';

interface TransactionProps {
  txAddress: string;
  token: string;
  amount: string | number;
}

export const Transaction: React.FC<TransactionProps> = ({
  txAddress,
  token,
  amount
}) => {
  return (
    <div className="transaction-item">
      <div className="transaction-item__details">
        <div className="transaction-item__address">
          <span className="label">Trx Address</span>
          <span className="value">{txAddress}</span>
        </div>
        <div className="transaction-item__token">
          <span className="label">Token</span>
          <span className="value">{token}</span>
        </div>
        <div className="transaction-item__amount">
          <span className="label">Amount</span>
          <span className="value">{amount}</span>
        </div>
      </div>
      <div className="transaction-item__divider"></div>
    </div>
  );
}; 