"use client";

import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../providers/LanguageProvider';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FiSettings, FiUser, FiShield } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();

  const handleRemoveWallet = () => {
    disconnect();
    router.push('/');
  }

  return (
    <MobileLayout title={t('profile.title')} showAvatar>
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
            {t('profile.accountInfo')}
          </h3>
          <FormField
            label={t('profile.walletAddress')}
            type="text"
            readOnly
            value="0x1234567890abcdef1234567890abcdef12345678"
          />
          <FormField
            label={t('profile.balance')}
            type="text"
            readOnly
            value="1,000,000 IDRX"
          />
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiSettings className="section-icon" />
            {t('profile.appearance')}
          </h3>
          <div className="setting-item">
            <div className="setting-item__label">{t('profile.theme')}</div>
            <ThemeToggle />
          </div>
          <div className="setting-item">
            <LanguageToggle />
          </div>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">
            <FiShield className="section-icon" />
            {t('profile.security')}
          </h3>
          <Button variant="danger" onClick={handleRemoveWallet}>
            {t('profile.disconnect')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
} 