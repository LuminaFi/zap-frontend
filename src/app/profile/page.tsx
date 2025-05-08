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

export default function ProfilePage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: ''
  });
  const [formattedAmount, setFormattedAmount] = useState('');

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
      // Format amount with commas
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue === '') {
        setFormattedAmount('');
        setWithdrawForm({
          ...withdrawForm,
          amount: ''
        });
      } else {
        // Format with commas
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
    // Here you would handle the withdrawal process
    console.log('Withdraw request:', withdrawForm);
    
    // For demo purposes, just close the modal and show a success message
    alert('Withdrawal request submitted successfully!');
    closeWithdrawModal();
  }

  return (
    <MobileLayout title={t('profile.title') || 'Profile'} showAvatar>
      <div className="profile-container">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">JK</div>
            <div className="profile-info">
              <h2 className="profile-name">John Kusuma</h2>
              <p className="profile-wallet">0x123...abc</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiUser className="section-icon" />
            {t('profile.accountInfo') || 'Account Information'}
          </h3>
          <FormField
            label={t('profile.walletAddress') || 'Wallet Address'}
            type="text"
            readOnly
            value="0x1234567890abcdef1234567890abcdef12345678"
          />
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