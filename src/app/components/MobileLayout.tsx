"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiQrScan } from 'react-icons/bi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { RiWalletLine } from 'react-icons/ri';
import { ProtectedRoute } from '../util/protected';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showAvatar?: boolean;
  avatarText?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showAvatar = false,
  avatarText = 'JK'
}) => {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="mobile-container">
        <div className="mobile-container__header">
          <h1 className="mobile-container__header-title">{title}</h1>
          {showAvatar && (
            <Link href="/profile" className="mobile-container__header-avatar">
              {avatarText}
            </Link>
          )}
        </div>
        <div className="mobile-container__content">
          {children}
        </div>
        <div className="bottom-sheet">
          <Link
            href="/scan"
            className="bottom-sheet__qr-button"
            aria-label="Send"
          >
            <BiQrScan size={32} />
          </Link>
          <nav className="bottom-sheet__navigation">
            <Link
              href="/account"
              className={`nav-item ${pathname === '/account' ? 'active' : ''}`}
            >
              <MdOutlineAccountBalanceWallet size={24} />
              <span>Account</span>
            </Link>
            <div className="nav-item-placeholder"></div>
            <Link
              href="/receive"
              className={`nav-item ${pathname === '/receive' ? 'active' : ''}`}
            >
              <RiWalletLine size={24} />
              <span>Receive</span>
            </Link>
          </nav>
        </div>
      </div>
    </ProtectedRoute>
    
  );
}; 