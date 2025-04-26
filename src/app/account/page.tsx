"use client";

import { MobileLayout } from '../components/MobileLayout';
import { Transaction } from '../components/Transaction';
import { useState } from 'react';

const mockTransactions = [
  {
    id: 1,
    txAddress: '0x1234...5678',
    token: 'IDRX',
    amount: '1,000,000'
  },
  {
    id: 2,
    txAddress: '0x8765...4321',
    token: 'IDRX',
    amount: '500,000'
  },
];

export default function AccountPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <MobileLayout title="Account" showAvatar>
      <div className="account-container">
        <div className="account-filter">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="account-filter__select"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>

        <div className="transactions-list">
          {mockTransactions.map((tx) => (
            <Transaction
              key={tx.id}
              txAddress={tx.txAddress}
              token={tx.token}
              amount={tx.amount}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
} 