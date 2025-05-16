"use client";

import { useState, useEffect } from 'react';
import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../providers/LanguageProvider';
import { useDisconnect, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FiSettings, FiUser, FiShield, FiCreditCard, FiLogOut, FiEdit } from 'react-icons/fi';
import { useTheme } from '../providers/ThemeProvider';
import { Modal } from '../components/Modal';

const truncateAddress = (address?: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const copyAnimationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .copy-notification {
    position: absolute;
    top: -35px;
    right: 0;
    background-color: #4ade80;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease-in-out forwards;
    z-index: 10;
  }
  
  .dark .copy-notification {
    background-color: #10b981;
  }
`;

export default function ProfilePage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [withdrawForm, setWithdrawForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: ''
  });
  const [formattedAmount, setFormattedAmount] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem(`displayName_${address}`);
      if (savedName) {
        setDisplayName(savedName);
      }
    }
  }, [address]);

  const handleRemoveWallet = () => {
    disconnect();
    router.push('/');
  }

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  }

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
  }

  const openEditNameModal = () => {
    setNewDisplayName(displayName);
    setIsEditNameModalOpen(true);
  }

  const closeEditNameModal = () => {
    setIsEditNameModalOpen(false);
  }

  const saveDisplayName = () => {
    if (newDisplayName.trim() && address) {
      window.location.reload();
      setDisplayName(newDisplayName.trim());
      localStorage.setItem(`displayName_${address}`, newDisplayName.trim());
      closeEditNameModal();

    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue === '') {
        setFormattedAmount('');
        setWithdrawForm({
          ...withdrawForm,
          amount: ''
        });
      } else {
        const formatted = new Intl.NumberFormat('en-US').format(parseInt(numericValue));
        setFormattedAmount(formatted);
        setWithdrawForm({
          ...withdrawForm,
          amount: numericValue
        });
      }
    } else {
      setWithdrawForm({
        ...withdrawForm,
        [name]: value
      });
    }
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Withdraw request:', withdrawForm);


    alert('Withdrawal request submitted successfully!');
    closeWithdrawModal();
  }

  return (
    <MobileLayout title={t('profile.title') || 'Profile'} showAvatar>
      <style jsx global>{copyAnimationStyles}</style>
      <div className="profile-container">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar" style={{ backgroundColor: '#FFD700 !important', background: '#FFD700 !important' }}>
              {displayName ? getInitials(displayName) : address ? address.substring(2, 4).toUpperCase() : ''}
            </div>
            <div className="profile-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="profile-name">
                  {displayName || truncateAddress(address)}
                </h2>
                <button
                  onClick={openEditNameModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <FiEdit size={16} />
                </button>
              </div>
              <p className="profile-wallet">{truncateAddress(address)}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiUser className="section-icon" />
            {t('profile.accountInfo') || 'Account Information'}
          </h3>
          <div className="wallet-address-field">
            <label className="field-label">
              {t('profile.walletAddress') || 'Wallet Address'}
            </label>
            <div className={`address-display ${theme}`} style={{
              padding: '12px 14px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
              borderRadius: '8px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p className="address-text" style={{
                  fontFamily: 'monospace',
                  fontWeight: '500',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-all',
                  fontSize: '14px'
                }}>
                  {address ? truncateAddress(address) : 'No wallet connected'}
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  }}
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>

                {isCopied && (
                  <div className={`copy-notification ${theme}`}>
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormField
            label={t('profile.balance') || 'Balance'}
            type="text"
            readOnly
            value="1,000,000 IDRX"
          />
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiCreditCard className="section-icon" />
            {t('profile.transactions') || 'Transactions'}
          </h3>
          <Button
            variant="primary"
            onClick={openWithdrawModal}
            fullWidth
            style={{ marginBottom: '12px' }}
          >
            {t('profile.withdrawToBank')}
          </Button>
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiSettings className="section-icon" />
            {t('profile.appearance') || 'Appearance'}
          </h3>
          <div className="setting-item">
            <div className="setting-item__label">{t('profile.theme') || 'Theme'}</div>
            <ThemeToggle />
          </div>
          <div className="setting-item">
            <LanguageToggle />
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiShield className="section-icon" />
            {t('profile.security') || 'Security'}
          </h3>
          <Button variant="danger" onClick={handleRemoveWallet}>
            <FiLogOut style={{ marginRight: '8px' }} /> {t('profile.disconnect') || 'Disconnect Wallet'}
          </Button>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        title={t('profile.withdrawToBank') || "Withdraw to Bank Account"}
      >
        <form onSubmit={handleWithdraw}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">
              {t('profile.bankName') || "Bank Name"}
            </label>
            <input
              name="bankName"
              type="text"
              required
              value={withdrawForm.bankName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter bank name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">
              {t('profile.accountNumber') || "Account Number"}
            </label>
            <input
              name="accountNumber"
              type="text"
              required
              value={withdrawForm.accountNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter account number"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">
              {t('profile.accountName') || "Account Holder Name"}
            </label>
            <input
              name="accountName"
              type="text"
              required
              value={withdrawForm.accountName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter account holder name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              {t('profile.amount') || "Amount"}
            </label>
            <div className="amount-input-wrapper">
              <div className="amount-input-prefix">
                IDRX
              </div>
              <input
                name="amount"
                type="text"
                inputMode="numeric"
                required
                value={formattedAmount}
                onChange={handleInputChange}
                className="form-input amount-input"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeWithdrawModal}
            >
              {t('profile.cancel') || "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {t('profile.withdraw') || "Withdraw"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditNameModalOpen}
        onClose={closeEditNameModal}
        title={t('profile.editName') || "Edit Display Name"}
      >
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">
            {t('profile.displayName') || "Display Name"}
          </label>
          <input
            type="text"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            className="form-input"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={closeEditNameModal}
          >
            {t('profile.cancel') || "Cancel"}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={saveDisplayName}
          >
            {t('profile.save') || "Save"}
          </Button>
        </div>
      </Modal>
    </MobileLayout>
  );
} 