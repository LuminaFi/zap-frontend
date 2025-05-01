"use client";

import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FiSettings, FiUser, FiShield } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const handleRemoveWallet = () => {
    disconnect();
    router.push('/');
  }

  return (
    <MobileLayout title="Profile" showAvatar>
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
            Account Information
          </h3>
          <FormField
            label="Wallet Address"
            type="text"
            readOnly
            value="0x1234567890abcdef1234567890abcdef12345678"
          />
          <FormField
            label="Balance"
            type="text"
            readOnly
            value="1,000,000 IDRX"
          />
        </div>

        <div className="profile-section">
          <h3 className="section-title">
            <FiSettings className="section-icon" />
            Appearance
          </h3>
          <div className="setting-item">
            <div className="setting-item__label">Theme Mode</div>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">
            <FiShield className="section-icon" />
            Security
          </h3>
          <Button variant="danger" onClick={handleRemoveWallet}>Disconnect Wallet</Button>
        </div>
      </div>
    </MobileLayout>
  );
} 