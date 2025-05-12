"use client";

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { ConnectButton } from '@xellar/kit';
import { UnprotectedRoute } from './util/unprotected';
import Image from 'next/image';

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
      <div className="mobile-container">
        <div className="mobile-container__content login-wrapper">
          <div className="login-logo">
            <div className="logo-container">
              <div className="lightning-effect"></div>
              <Image 
                src="/zap-logo.png" 
                alt="Zap Logo" 
                width={120} 
                height={120}
                className="zap-logo"
                priority
              />
            </div>
            <h2 className="logo-title">BANK <span className="logo-accent">INDONESIA</span></h2>
          </div>
          
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
              <div className="authenticating">
                <div className="loading-spinner"></div>
            <h1 className="login-title">Authenticating...</h1>
              </div>
          )}
          </div>
        </div>
      </div>
    </UnprotectedRoute>
  );
}
