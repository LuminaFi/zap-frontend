"use client";

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { ConnectButton } from '@xellar/kit';
import { UnprotectedRoute } from './util/unprotected';

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      router.push('/account');
    }
  }, [address, router]);

  return (
    <UnprotectedRoute>
      <div className="login-page">
        <div className="login-container">
          {!address ? (
            <>
              <h1 className="login-title">Login</h1>
              <div className="login-content">
                <p className="login-subtitle">Connect Wallet</p>
                <ConnectButton/>
              </div>
            </>
          ): (
            <h1 className="login-title">Authenticating...</h1>
          )}
        </div>
      </div>
    </UnprotectedRoute>
  );
}
