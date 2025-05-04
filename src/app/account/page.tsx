"use client";

import { MobileLayout } from '../components/MobileLayout';
import { Transaction } from '../components/Transaction';
import { TransactionSkeleton } from '../components/TransactionSkeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FiArrowUpRight, FiArrowDownLeft, FiFilter, FiCalendar } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';

// Types for the transaction data from API
interface ApiTransaction {
  id: string;
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
  isContractInteraction?: boolean;
  functionName?: string | null;
  methodId?: string | null;
  token: string;
}

// Types for our component
interface TransactionData {
  id: string;
  txAddress: string;
  token: string;
  amount: string;
  type: 'received' | 'sent';
  date: string;
}

// Type for API response
interface ApiResponse {
  success: boolean;
  address: string;
  transactions: ApiTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    totalTransactions: number;
    sentTransactions: number;
    receivedTransactions: number;
    totalSent: string;
    totalReceived: string;
    lastTransaction: string | null;
  };
  error?: string;
}

// Filter types
type FilterType = 'all' | 'sent' | 'received';
type DirectionType = 'all' | 'from' | 'to';
type SortType = 'asc' | 'desc';

// Helper function to get filter display text
const getFilterDisplayText = (
  direction: DirectionType,
  hasDateFilter: boolean
) => {
  if (direction !== 'all' || hasDateFilter) {
    if (direction === 'from') return 'From Me';
    if (direction === 'to') return 'To Me';
    return 'Custom';
  }
  return 'All';
};

export default function AccountPage() {
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [currentFilter, setCurrentFilter] = useState<FilterType>(
    (searchParams.get('filter') as FilterType) || 'all'
  );

  // Advanced filtering state
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Current applied filters
  const [direction, setDirection] = useState<DirectionType>(
    (searchParams.get('direction') as DirectionType) || 'all'
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

  // Temporary filter state (for the modal)
  const [tempDirection, setTempDirection] = useState<DirectionType>(direction);
  const [tempSort, setTempSort] = useState<SortType>(sort);
  const [tempStartDate, setTempStartDate] = useState<string>(startDate);
  const [tempEndDate, setTempEndDate] = useState<string>(endDate);

  // Set temp filters when opening modal
  useEffect(() => {
    if (showFilterModal) {
      setTempDirection(direction);
      setTempSort(sort);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [showFilterModal, direction, sort, startDate, endDate]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 5; // Changed from 10 to 5 transactions per page

  // Reference to the observer element
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTransactionElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;

    // Disconnect previous observer
    if (observer.current) observer.current.disconnect();

    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('Loading more transactions, current page:', currentPage);
        loadMoreTransactions();
      }
    }, {
      root: null,
      rootMargin: '100px', // Load more when 100px from the bottom
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, currentPage]);

  // TODO: Get user address from authentication context/store
  // For now using a static address for demo purposes
  const userAddress = '0x85E0FE0Ef81608A6C266373fC8A3B91dF622AF7a';

  // Build query parameters for API request
  const buildQueryParams = (page: number) => {
    const params = new URLSearchParams();

    // Pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // Filtering
    if (direction !== 'all') {
      params.append('filterBy', direction);
    }

    // Sorting
    params.append('sort', sort);

    // Date range - using just YYYY-MM-DD format
    if (startDate) {
      params.append('startDate', startDate); // Just pass the YYYY-MM-DD string
    }

    if (endDate) {
      params.append('endDate', endDate); // Just pass the YYYY-MM-DD string
    }

    return params.toString();
  };

  // Load additional transactions
  const loadMoreTransactions = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    // Increment the page number
    const nextPage = currentPage + 1;
    console.log(`Loading page ${nextPage} with limit ${limit}`);
    setCurrentPage(nextPage);
  }, [hasMore, isLoadingMore, currentPage, limit]);

  // Update URL with current filters
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

    // Create URL string
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';

    // Update the URL without reloading the page
    window.history.replaceState({}, '', `${window.location.pathname}${url}`);
  }, [currentFilter, direction, sort, startDate, endDate]);

  // Handle applying filters
  const applyFilters = () => {
    // Apply temporary filters to the actual filter state
    setDirection(tempDirection);
    setSort(tempSort);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    
    console.log('Applying filters:', { 
      direction: tempDirection, 
      sort: tempSort, 
      startDate: tempStartDate, 
      endDate: tempEndDate 
    });
    
    // Reset pagination and transactions when filters change
    setTransactions([]);
    setCurrentPage(1);
    setShowFilterModal(false);
    
    // Update URL with new filters
    updateUrlParams();
  };

  // Reset all filters
  const resetFilters = () => {
    setDirection('all');
    setSort('desc');
    setStartDate('');
    setEndDate('');
    setCurrentFilter('all');
    setTransactions([]);
    setCurrentPage(1);
    setShowFilterModal(false);

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Compute the filter display text and active state
  const hasDateFilter = !!(startDate || endDate);
  const hasActiveFilters = direction !== 'all' || hasDateFilter;
  const filterDisplayText = getFilterDisplayText(direction, hasDateFilter);

  // Fetch transactions from the API
  useEffect(() => {
    const fetchTransactions = async () => {
      const isInitialLoad = currentPage === 1;

      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        console.log(`Fetching page ${currentPage} with limit ${limit}`);
      }

      setError(null);

      try {
        const queryParams = buildQueryParams(currentPage);
        console.log(`API request: ${queryParams}`);
        const response = await fetch(`https://zap-service-jkce.onrender.com/api/transactions/${userAddress}?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }

        // Set hasMore flag based on API response
        setHasMore(data.pagination.hasMore);

        if (isInitialLoad) {
          // Calculate balance from total received minus total sent
          const totalReceived = parseFloat(data.summary.totalReceived || '0');
          const totalSent = parseFloat(data.summary.totalSent || '0');
          const currentBalance = totalReceived - totalSent;

          // Format balance with commas
          setBalance(currentBalance.toLocaleString('id-ID'));
        }

        // Transform API transactions to our component format
        const mappedTransactions: TransactionData[] = data.transactions.map(tx => {
          // Determine if this transaction is sent or received
          const isSent = tx.from.toLowerCase() === userAddress.toLowerCase();

          return {
            id: tx.hash,
            txAddress: isSent ? tx.to : tx.from,
            token: tx.token || 'IDRX',
            amount: tx.valueInEther || tx.value,
            type: isSent ? 'sent' : 'received',
            date: tx.formattedDate || new Date(Number(tx.timestamp) * 1000).toLocaleDateString()
          };
        });

        // Append new transactions to existing ones if loading more
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
  }, [userAddress, currentPage, direction, sort, startDate, endDate, currentFilter, limit]);

  // Filter transactions based on selected type
  const filteredTransactions = currentFilter === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === currentFilter);

  return (
    <MobileLayout title="My Account" showAvatar>
      <div className="account-container">
        <div className="account-balance-card">
          <h3 className="balance-label">Total Balance</h3>
          <div className="balance-amount">
            {isLoading && currentPage === 1 ?
              <div className="shimmer" style={{ height: '36px', width: '180px' }}></div> :
              `Rp ${balance}`
            }
          </div>
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

          {/* Filter Modal */}
          <Modal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            title="Filter Transactions"
          >
            <div className="filter-content">
              <div className="filter-group">
                <label>Direction</label>
                <div className="custom-select">
                  <select
                    value={tempDirection}
                    onChange={(e) => setTempDirection(e.target.value as DirectionType)}
                    className="filter-select"
                  >
                    <option value="all">All</option>
                    <option value="from">From Me</option>
                    <option value="to">To Me</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label>Sort</label>
                <div className="custom-select">
                  <select
                    value={tempSort}
                    onChange={(e) => setTempSort(e.target.value as SortType)}
                    className="filter-select"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label>From Date</label>
                <div className="date-input-container">
                  <FiCalendar className="date-icon" />
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>To Date</label>
                <div className="date-input-container">
                  <FiCalendar className="date-icon" />
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="date-input"
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
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={applyFilters}
                  className="apply-button"
                  fullWidth
                >
                  Apply Filters
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
              <>
                {filteredTransactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    ref={
                      index === filteredTransactions.length - 1
                        ? lastTransactionElementRef
                        : undefined
                    }
                  >
                    <Transaction
                      txAddress={tx.txAddress}
                      token={tx.token}
                      amount={tx.amount}
                      type={tx.type}
                      date={tx.date}
                      id={tx.id}
                    />
                  </div>
                ))}

                {isLoadingMore && (
                  <div className="loading-more-container">
                    <TransactionSkeleton count={1} />
                  </div>
                )}


              </>
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