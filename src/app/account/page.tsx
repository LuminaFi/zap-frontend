"use client";

import { MobileLayout } from '@/components/MobileLayout';
import { Transaction } from '@/components/Transaction';
import { TransactionSkeleton } from '@/components/TransactionSkeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { FiFilter, FiCalendar, FiRefreshCw, FiInbox } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import React from 'react';
import { DirectionType, FilterType, SortType, TransactionData } from './types';
import { formatAbbreviatedNumber } from '@/utils/formatNumber';
import { getFilterDisplayText } from '@/utils/getFilterDisplayText';
import { getBalance, getTransaction } from './apiRequest';
import { useAccount } from 'wagmi';

export default function AccountPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [balance, setBalance] = useState<string>('0');
  const [currentFilter, setCurrentFilter] = useState<FilterType>(
    (searchParams.get('filter') as FilterType) || 'all'
  );

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [direction, setDirection] = useState<DirectionType>(
    (searchParams.get('direction') as DirectionType) || 'to'
  );
  const [sort, setSort] = useState<SortType>(
    (searchParams.get('sort') as SortType) || 'desc'
  );
  const [startDate, setStartDate] = useState<string>(
    searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState<string>(
    searchParams.get('endDate') || ''
  );

  const [tempDirection, setTempDirection] = useState<DirectionType>(direction);
  const [tempSort, setTempSort] = useState<SortType>(sort);
  const [tempStartDate, setTempStartDate] = useState<string>(startDate);
  const [tempEndDate, setTempEndDate] = useState<string>(endDate);

  const hasDateFilter = !!(startDate || endDate);
  const hasActiveFilters = direction !== 'all' || hasDateFilter;
  const filterDisplayText = getFilterDisplayText(direction, hasDateFilter);

  const today = new Date().toISOString().split('T')[0];

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 5;

  const observer = useRef<IntersectionObserver | null>(null);
  const { address: userAddress } = useAccount();

  useEffect(() => {
    if (showFilterModal) {
      setTempDirection(direction);
      setTempSort(sort);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [showFilterModal, direction, sort, startDate, endDate]);

  const buildQueryParams = useCallback((page: number) => {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (direction !== 'all') {
      params.append('filterBy', direction);
    }

    params.append('sort', sort);

    if (startDate) {
      params.append('startDate', startDate);
    }

    if (endDate) {
      params.append('endDate', endDate);
    }

    return params.toString();
  }, [limit, direction, sort, startDate, endDate]);

  const loadMoreTransactions = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
  }, [hasMore, isLoadingMore, currentPage]);

  const lastTransactionElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTransactions();
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, loadMoreTransactions]);

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (currentFilter !== 'all') {
      params.append('filter', currentFilter);
    }

    if (direction !== 'all') {
      params.append('direction', direction);
    }

    if (sort !== 'desc') {
      params.append('sort', sort);
    }

    if (startDate) {
      params.append('startDate', startDate);
    }

    if (endDate) {
      params.append('endDate', endDate);
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';

    window.history.replaceState({}, '', `${window.location.pathname}${url}`);
  }, [currentFilter, direction, sort, startDate, endDate]);

  const applyFilters = () => {
    setDirection(tempDirection);
    setSort(tempSort);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);

    setTransactions([]);
    setCurrentPage(1);
    setShowFilterModal(false);

    updateUrlParams();
  };

  const resetFilters = () => {
    setDirection('all');
    setSort('desc');
    setStartDate('');
    setEndDate('');
    setCurrentFilter('all');
    setTransactions([]);
    setCurrentPage(1);
    setShowFilterModal(false);

    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);

    setTransactions([]);
    setCurrentPage(1);
    setError(null);

    setRefreshTrigger(prev => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userAddress) {
        setIsLoading(false);
        return;
      }

      const isInitialLoad = currentPage === 1;

      if (isInitialLoad) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const queryParams = buildQueryParams(currentPage);
        
        const data = await getTransaction(userAddress, queryParams);
        setHasMore(data.pagination.hasMore);

        const mappedTransactions: TransactionData[] = data.transactions.map(tx => {
          const isSent = userAddress ? tx.from.toLowerCase() === userAddress.toLowerCase() : false;

          let formattedDate = '';
          try {
            if (tx.formattedDate) {
              formattedDate = tx.formattedDate;
            } else if (tx.timestamp) {
              const date = new Date(Number(tx.timestamp) * 1000);
              formattedDate = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            }
          } catch (error) {
            console.error('Error formatting date:', error);
            formattedDate = 'Unknown date';
          }

          // Format the IDR value using valueInIDR if available
          const valueInIDR = tx.valueInIDR
            ? formatAbbreviatedNumber(tx.valueInIDR)
            : formatAbbreviatedNumber(tx.valueInEther || tx.value);

          return {
            id: tx.hash,
            txAddress: isSent ? tx.to : tx.from,
            token: tx.token || 'IDRX',
            amount: valueInIDR,
            type: isSent ? 'sent' : 'received',
            date: formattedDate,
            hash: tx.hash,
            valueInIDR: valueInIDR
          };
        });

        if (isInitialLoad) {
          setTransactions(mappedTransactions);
        } else {
          setTransactions(prev => [...prev, ...mappedTransactions]);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchTransactions();
  }, [userAddress, currentPage, direction, sort, startDate, endDate, currentFilter, limit, refreshTrigger, buildQueryParams]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!userAddress) {
        setIsBalanceLoading(false);
        setBalance('Rp 0');
        return;
      }

      setIsBalanceLoading(true);

      try {
        const data = await getBalance(userAddress);

        if (data.success) {
          setBalance(data.formattedBalance || 'Rp 0');
        } else {
          console.error('Failed to fetch balance:', data.error);
          setBalance('Rp 0');
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
        setBalance('Rp 0');
      } finally {
        setIsBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [userAddress, refreshTrigger]);

  const filteredTransactions = currentFilter === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === currentFilter);

  useEffect(() => {
  }, []);

  const { theme } = useTheme();

  return (
    <MobileLayout title={t('account.title')} showAvatar>
      <div className="account-container">
        <div className="account-balance-card">
          <div className="balance-card-header">
            <h3 className="balance-label">{t('account.totalBalance')}</h3>
            <div className="refresh-wrapper">
              <button
                type="button"
                onClick={handleRefreshData}
                className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                disabled={isRefreshing}
                aria-label={t('account.refresh')}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  position: 'relative',
                }}
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
          </div>
          <div className="balance-amount">
            {isBalanceLoading ? (
              <div className="shimmer" style={{ height: '36px', width: '180px' }}></div>
            ) : (
              formatAbbreviatedNumber(balance)
            )}
          </div>
          <div className="balance-currency">{t('account.currency')}</div>
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h3 className="section-title">{t('account.transactionHistory')}</h3>

            <div className="filter-actions">
              <div
                className={`filter-dropdown ${hasActiveFilters ? 'active' : ''}`}
                onClick={() => setShowFilterModal(true)}
              >
                <FiFilter />
                <span>{filterDisplayText}</span>
              </div>
            </div>
          </div>

          <Modal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            title={t('filter.title')}
          >
            <div className="filter-content">
              <div className="filter-group">
                <label>{t('filter.direction')}</label>
                <div className="custom-select">
                  <select
                    value={tempDirection}
                    onChange={(e) => setTempDirection(e.target.value as DirectionType)}
                    className="filter-select"
                  >
                    <option value="all">{t('filter.all')}</option>
                    <option value="from">{t('filter.fromMe')}</option>
                    <option value="to">{t('filter.toMe')}</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label>{t('filter.sort')}</label>
                <div className="custom-select">
                  <select
                    value={tempSort}
                    onChange={(e) => setTempSort(e.target.value as SortType)}
                    className="filter-select"
                  >
                    <option value="desc">{t('filter.newest')}</option>
                    <option value="asc">{t('filter.oldest')}</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label>{t('filter.fromDate')}</label>
                <div className="date-input-container">
                  <FiCalendar className="date-icon" />
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="date-input"
                    max={today}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>{t('filter.toDate')}</label>
                <div className="date-input-container">
                  <FiCalendar className="date-icon" />
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="date-input"
                    max={today}
                  />
                </div>
              </div>

              <div className="filter-button-row">
                <Button
                  variant="outline"
                  size="small"
                  onClick={resetFilters}
                  className="reset-button"
                  fullWidth
                >
                  {t('filter.reset')}
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={applyFilters}
                  className="apply-button"
                  fullWidth
                >
                  {t('filter.apply')}
                </Button>
              </div>
            </div>
          </Modal>

          <div className="transactions-list">
            {isLoading && currentPage === 1 ? (
              <TransactionSkeleton count={5} />
            ) : error ? (
              <div className="error-transactions">
                <p>{error}</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="transaction-items-container">
                {filteredTransactions.map((tx, index) => {
                  const isLast = index === filteredTransactions.length - 1;
                  return (
                    <div
                      className="transaction-item-wrapper"
                      key={`${tx.id}-${index}`}
                      ref={isLast ? lastTransactionElementRef : null}
                    >
                      <Transaction
                        txAddress={tx.txAddress}
                        token={tx.token}
                        amount={tx.valueInIDR}
                        type={tx.type}
                        date={tx.date}
                        id={tx.hash}
                      />
                    </div>
                  );
                })}
                {isLoadingMore && (
                  <div className="loading-more-container">
                    <TransactionSkeleton count={1} />
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-transactions" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                borderRadius: '12px',
                margin: '20px 0'
              }}>
                <FiInbox size={64} style={{
                  color: theme === 'dark' ? '#4b5563' : '#9ca3af',
                  marginBottom: '16px'
                }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: theme === 'dark' ? '#e5e7eb' : '#111827'
                }}>

                  {t('account.noTransactions') || 'Your transaction history will appear here once you start sending or receiving funds.'}
                </h3>
              </div>
            )}

          </div>
        </div>
      </div>
    </MobileLayout>
  );
}