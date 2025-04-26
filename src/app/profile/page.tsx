import { MobileLayout } from '../components/MobileLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';

export default function ProfilePage() {
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
        <Button variant="outline">Remove Wallet</Button>
      </div>
    </MobileLayout>
  );
} 