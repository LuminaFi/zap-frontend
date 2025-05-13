"use client";

import { useState } from 'react';
import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../providers/LanguageProvider';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FiSettings, FiUser, FiShield, FiCreditCard, FiX } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { useTheme } from '../providers/ThemeProvider';

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
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: ''
  });
  const [formattedAmount, setFormattedAmount] = useState('');
  const { address } = useAccount();
  const [isCopied, setIsCopied] = useState(false);

  const truncateAddress = (address?: string) => {
    if (!address || address.length < 10) return address || '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 4)}`;
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

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
            <div className="profile-avatar">JK</div>
            <div className="profile-info">
              <h2 className="profile-name">John Kusuma</h2>
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
              {t('profile.walletAddress') || 'Recipient Address'}
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
                  {truncateAddress(address)}
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
            {t('profile.disconnect') || 'Disconnect Wallet'}
          </Button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="modal-title">
              {t('profile.withdrawToBank')}
            </h3>

            <button
              onClick={closeWithdrawModal}
              className="modal-close-button"
            >
              <FiX />
            </button>

            <div style={{ padding: '0 20px 20px' }}>
              <form onSubmit={handleWithdraw}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">
                    {t('profile.bankName')}
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
                    {t('profile.accountNumber')}
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
                    {t('profile.accountName')}
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
                    {t('profile.amount')}
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
                    {t('profile.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {t('profile.withdraw')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
} 