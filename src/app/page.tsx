"use client";

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleConnectWallet = () => {
    router.push('/account');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login</h1>
        <div className="login-content">
          <p className="login-subtitle">Connect Wallet</p>
          <button 
            className="connect-wallet-button"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
