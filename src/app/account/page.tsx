"use client";

import { MobileLayout } from '../components/MobileLayout';
import { Transaction } from '../components/Transaction';
import { useState } from 'react';
import { Button } from '../components/Button';
import { FiArrowUpRight, FiArrowDownLeft, FiFilter } from 'react-icons/fi';

const mockTransactions = [
  {
    id: 1,
    txAddress: '0x1234...5678',
    token: 'IDRX',
    amount: '1,000,000',
    type: 'received',
    date: '2023-09-15'
  },
  {
    id: 2,
    txAddress: '0x8765...4321',
    token: 'IDRX',
    amount: '500,000',
    type: 'sent',
    date: '2023-09-14'
  },
  {
    id: 3,
    txAddress: '0x9876...2345',
    token: 'IDRX',
    amount: '2,500,000',
    type: 'received',
    date: '2023-09-12'
  },
];

export default function AccountPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredTransactions = selectedFilter === 'all' 
    ? mockTransactions
    : mockTransactions.filter(tx => tx.type === selectedFilter);

  return (
    <MobileLayout title="My Account" showAvatar>
      <div className="account-container">
        <div className="account-balance-card">
          <h3 className="balance-label">Total Balance</h3>
          <div className="balance-amount">Rp 3,500,000</div>
          <div className="balance-currency">IDRX</div>
          
          <div className="quick-actions">
            <Button variant="primary" size="small" fullWidth={false} className="action-button">
              <FiArrowUpRight /> <span>Send</span>
            </Button>
            <Button variant="outline" size="small" fullWidth={false} className="action-button">
              <FiArrowDownLeft /> <span>Receive</span>
            </Button>
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h3 className="section-title">Transaction History</h3>
            <div className="account-filter">
              <FiFilter className="filter-icon" />
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="account-filter__select"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>

          <div className="transactions-list">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <Transaction
                  key={tx.id}
                  txAddress={tx.txAddress}
                  token={tx.token}
                  amount={tx.amount}
                  type={tx.type}
                  date={tx.date}
                />
              ))
            ) : (
              <div className="empty-transactions">
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
} 