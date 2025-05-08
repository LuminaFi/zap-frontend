"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => { },
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

const en = {
  // General
  'app.name': 'IDRX Banking',
  'app.loading': 'Loading...',
  'app.error': 'An error occurred',
  'app.empty': 'No data available',

  // Navigation
  'nav.home': 'Home',
  'nav.account': 'Account',
  'nav.profile': 'Profile',
  'nav.send': 'Send',
  'nav.receive': 'Receive',

  // Account page
  'account.title': 'My Account',
  'account.totalBalance': 'Total Balance',
  'account.currency': 'IDRX',
  'account.send': 'Send',
  'account.receive': 'Receive',
  'account.transactionHistory': 'Transaction History',
  'account.noTransactions': 'No transactions found',
  'account.loadingTransactions': 'Loading transactions...',
  'account.refresh': 'Refresh data',

  // Filter
  'filter.title': 'Filter Transactions',
  'filter.direction': 'Direction',
  'filter.all': 'All',
  'filter.fromMe': 'From Me',
  'filter.toMe': 'To Me',
  'filter.sort': 'Sort',
  'filter.newest': 'Newest First',
  'filter.oldest': 'Oldest First',
  'filter.fromDate': 'From Date',
  'filter.toDate': 'To Date',
  'filter.reset': 'Reset',
  'filter.apply': 'Apply Filters',

  // Transaction
  'transaction.sent': 'Sent',
  'transaction.received': 'Received',

  // Profile
  'profile.title': 'Profile',
  'profile.accountInfo': 'Account Information',
  'profile.walletAddress': 'Wallet Address',
  'profile.balance': 'Balance',
  'profile.appearance': 'Appearance',
  'profile.theme': 'Theme Mode',
  'profile.language': 'Language',
  'profile.english': 'English',
  'profile.indonesian': 'Indonesian',
  'profile.security': 'Security',
  'profile.disconnect': 'Disconnect Wallet',

  'send.recipientAddress': 'Recipient Address',
  'send.amount': 'Amount',
  'send.enterAmount': 'Enter Amount',
  'send.sendButton': 'Send',
  'send.title': 'Send',
  'send.idrxPrefix': 'IDRX',
  'send.network': 'Network',
  'send.token': 'Token',
  'send.selectToken': 'Select Token',
};

const id = {
  // General
  'app.name': 'IDRX Banking',
  'app.loading': 'Memuat...',
  'app.error': 'Terjadi kesalahan',
  'app.empty': 'Tidak ada data',

  // Navigation
  'nav.home': 'Beranda',
  'nav.account': 'Akun',
  'nav.profile': 'Profil',
  'nav.send': 'Kirim',
  'nav.receive': 'Terima',

  // Account page
  'account.title': 'Akun Saya',
  'account.totalBalance': 'Total Saldo',
  'account.currency': 'IDRX',
  'account.send': 'Kirim',
  'account.receive': 'Terima',
  'account.transactionHistory': 'Riwayat Transaksi',
  'account.noTransactions': 'Tidak ada transaksi',
  'account.loadingTransactions': 'Memuat transaksi...',
  'account.refresh': 'Muat ulang data',

  // Filter
  'filter.title': 'Filter Transaksi',
  'filter.direction': 'Arah',
  'filter.all': 'Semua',
  'filter.fromMe': 'Dari Saya',
  'filter.toMe': 'Ke Saya',
  'filter.sort': 'Urutan',
  'filter.newest': 'Terbaru Dulu',
  'filter.oldest': 'Terlama Dulu',
  'filter.fromDate': 'Dari Tanggal',
  'filter.toDate': 'Sampai Tanggal',
  'filter.reset': 'Reset',
  'filter.apply': 'Terapkan Filter',

  // Transaction
  'transaction.sent': 'Terkirim',
  'transaction.received': 'Diterima',

  // Profile
  'profile.title': 'Profil',
  'profile.accountInfo': 'Informasi Akun',
  'profile.walletAddress': 'Alamat Wallet',
  'profile.balance': 'Saldo',
  'profile.appearance': 'Tampilan',
  'profile.theme': 'Mode Tema',
  'profile.language': 'Bahasa',
  'profile.english': 'Inggris',
  'profile.indonesian': 'Indonesia',
  'profile.security': 'Keamanan',
  'profile.disconnect': 'Putus Sambungan Wallet',

  'send.recipientAddress': 'Alamat Penerima',
  'send.amount': 'Jumlah',
  'send.enterAmount': 'Masukkan Jumlah',
  'send.sendButton': 'Kirim',
  'send.title': 'Kirim',
  'send.network': 'Jaringan',
  'send.token': 'Token',
  'send.selectToken': 'Pilih Token',
};

const translations = { en, id };

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguageState(savedLanguage);
    }
  }, []);
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };


  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const contextValue = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 