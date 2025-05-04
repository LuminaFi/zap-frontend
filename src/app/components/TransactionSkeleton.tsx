"use client";

import React from 'react';

interface TransactionSkeletonProps {
  count?: number;
}

export const TransactionSkeleton: React.FC<TransactionSkeletonProps> = ({ count = 5 }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div className="transaction-skeleton" key={`skeleton-${index}`}>
          <div className="icon-skeleton"></div>
          <div className="content-skeleton">
            <div className="details-skeleton">
              <div className="address-skeleton"></div>
              <div className="date-skeleton"></div>
            </div>
            <div className="amount-skeleton">
              <div className="token-skeleton"></div>
              <div className="value-skeleton"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}; 