"use client";

import { useState } from 'react';
import { MobileLayout } from '../components/MobileLayout';
import { BiQrScan } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

type SendStep = 'initial' | 'qr-scan' | 'amount';

interface SendData {
  address?: string;
  amount?: string;
}

export default function SendPage() {
  const [step, setStep] = useState<SendStep>('initial');
  const [sendData, setSendData] = useState<SendData>({});
  const router = useRouter();

  const handleManualInput = () => {
    setStep('amount');
  };

  const handleQRScan = () => {
    setStep('qr-scan');
    setTimeout(() => {
      setSendData({ address: '0x1234...5678' });
      setStep('amount');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending transaction:', sendData);
    router.push('/account');
  };

  return (
    <MobileLayout title="Send" showAvatar>
      <div className="send-container">
        {step === 'initial' && (
          <div className="send-options">
            <button className="send-option-button" onClick={handleQRScan}>
              <BiQrScan size={32} />
              <span>Scan QR Code</span>
            </button>
            <div className="send-option-divider">
              <span>or</span>
            </div>
            <button className="send-option-button" onClick={handleManualInput}>
              <span>Manual Input</span>
            </button>
          </div>
        )}

        {step === 'qr-scan' && (
          <div className="qr-scanner">
            <div className="qr-scanner__frame">
              <div className="qr-scanner__loading">Scanning...</div>
            </div>
          </div>
        )}

        {step === 'amount' && (
          <form onSubmit={handleSubmit} className="send-form">
            {sendData.address && (
              <div className="send-form__address">
                <label>Recipient Address</label>
                <p>{sendData.address}</p>
              </div>
            )}
            <div className="send-form__amount">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={sendData.amount || ''}
                onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="send-form__submit">
              Send
            </button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
} 