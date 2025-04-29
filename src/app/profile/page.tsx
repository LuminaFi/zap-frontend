"use client";

import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

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
        <FormField
          label="Wallet Address"
          type="text"
          readOnly
          value="0x123...abc"
        />
        <FormField
          label="Balance"
          type="text"
          readOnly
          value="1,000,000 IDRX"
        />
        <Button variant="outline" onClick={handleRemoveWallet}>Remove Wallet</Button>
      </div>
    </MobileLayout>
  );
} 