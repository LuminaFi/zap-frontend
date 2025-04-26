import { MobileLayout } from '../components/MobileLayout';
import { Button } from '../components/Button';

export default function ReceivePage() {
  return (
    <MobileLayout title="Receive" showAvatar>
      <div className="receive-container">
        <div className="qr-container">
          {/* QR code will be implemented here */}
        </div>
        <div className="amount-display">
          <p className="amount">IDRX 1,000,000</p>
          <Button>Input Amount</Button>
        </div>
      </div>
    </MobileLayout>
  );
} 