"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiQrScan } from 'react-icons/bi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { RiWalletLine } from 'react-icons/ri';
import { ProtectedRoute } from '../util/protected';
import { useLanguage } from '../providers/LanguageProvider';
import { useAccount } from 'wagmi';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showAvatar?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showAvatar = false,
}) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { address } = useAccount();
  const [avatarText, setAvatarText] = useState('');
  const avatarColor = '#FFD700'; // Gold/yellow color

  useEffect(() => {
    if (typeof window !== 'undefined' && address) {
      const savedName = localStorage.getItem(`displayName_${address}`);
      if (savedName) {
        setAvatarText(getInitials(savedName));
      } else {
        setAvatarText(address.substring(2, 4).toUpperCase());
      }
    }
  }, [address]);

  return (
    <ProtectedRoute>
      <div className="mobile-container">
        <div className="mobile-container__header">
          <h1 className="mobile-container__header-title">{title}</h1>
          {showAvatar && (
            <Link href="/profile" className="mobile-container__header-avatar" style={{ backgroundColor: avatarColor }}>
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
            aria-label={t('nav.send')}
          >
            <BiQrScan size={32} />
          </Link>
          <nav className="bottom-sheet__navigation">
            <Link
              href="/account"
              className={`nav-item ${pathname === '/account' ? 'active' : ''}`}
            >
              <MdOutlineAccountBalanceWallet size={24} />
              <span>{t('nav.account')}</span>
            </Link>
            <div className="nav-item-placeholder"></div>
            <Link
              href="/receive"
              className={`nav-item ${pathname === '/receive' ? 'active' : ''}`}
            >
              <RiWalletLine size={24} />
              <span>{t('nav.receive')}</span>
            </Link>
          </nav>
        </div>
      </div>
    </ProtectedRoute>

  );
}; 