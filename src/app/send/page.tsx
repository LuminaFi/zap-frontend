"use client";

import { useEffect, useState, useRef } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { ZAP_POOL } from "@/utils/constant";
import { erc20Abi, parseUnits } from "viem";
import { DefaultError, useMutation, useQuery } from "@tanstack/react-query";
import type {
  AddressType,
  Network,
  QRTypes,
  SendData,
  Token,
  TransferIDRXPayload,
  TransferIDRXResponse,
  TransferLimitResponse,
} from "./types";
import { Button } from "../../components/Button";
import { useLanguage } from "../../providers/LanguageProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { FaChevronDown } from "react-icons/fa";
import Image from "next/image";
import { TransferLimit } from "../../components/TransferLimit";
import { getTransferLimit } from "../../utils/getTransferLimit";
import { formatNumber } from "../../utils/formatNumber";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "../../configs/xellarConfig";
import { calculateDynamicQrAmount, calculateStaticQrAmount, getNetworkTokens, getSupportedNetworks, getTokenPrice, transfer } from "./apiRequest";

const copyAnimationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .copy-notification {
    position: absolute;
    top: -35px;
    right: 0;
    background-color: #4ade80;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease-in-out forwards;
    z-index: 10;
  }
  
  .dark .copy-notification {
    background-color: #10b981;
  }
  
  /* Remove spinner buttons from number input */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

export default function SendPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<Partial<SendData>>({});
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);

  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isValidAmount, setIsValidAmount] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);

  const {
    data: limitData,
    isLoading: isLoadingLimit,
  } = useQuery<TransferLimitResponse>({
    queryKey: [`limit-${selectedToken?.symbol}`],
    queryFn: () => getTransferLimit(selectedToken!),
  });

  const {
    data: networks,
    isLoading: isLoadingNetworks,
    refetch: refetchNetworks
  } = useQuery<Network[]>({
    queryKey: [`fetch-network`],
    queryFn: getSupportedNetworks
  });

  const {
    data: tokens,
    isLoading: isLoadingTokens,
    refetch: refetchTokens
  } = useQuery<Token[]>({
    queryKey: [`fetch-token`],
    queryFn: () => getNetworkTokens(selectedNetwork!.id)
  });

  const { mutate: transferIDRX, isPending: isLoadingTrf } = useMutation<
    TransferIDRXResponse,
    DefaultError,
    TransferIDRXPayload
  >({
    mutationKey: ["transferIDRX"],
    mutationFn: (payload) => transfer(payload),
    onSuccess: () => router.push("/account"),
    onError: (error) => alert(error.message),
  });

  useEffect(() => {
    if (networks?.length) {
      setSelectedNetwork(networks[0]);
    }
  }, [networks]);

  useEffect(() => {
    if (tokens?.length) {
      setSelectedToken(tokens[0]);
    }
  }, [tokens]);

  useEffect(() => {
    const address = search.get("address") as AddressType;
    const amount = Number(search.get("amount") as string);
    if (address) {
      setSendData({ address, amount });
    }
    setQRType(amount ? "dynamic" : "static");
    if (amount) {
      setIsValidAmount(true)
    }
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target as Node)) {
        setIsTokenDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (sendData.amount) {
      setFormattedAmount(formatNumber(String(sendData.amount)));
    }
  }, [sendData.amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const calculateAmount = async () => {
      const amount = sendData.amount!;
      return qrType === "static" ? calculateStaticQrAmount(amount, selectedToken) : calculateDynamicQrAmount(amount, selectedToken);
    }

    calculateAmount()
      .then(async (amount) => {
        const decimal = await readContract(config, {
          address: `${selectedToken?.addresses.testnet}` as AddressType,
          abi: erc20Abi,
          functionName: "decimals",
        });

        await writeContract(config, {
          address: `${selectedToken?.addresses.testnet}` as AddressType,
          abi: erc20Abi,
          functionName: "transfer",
          args: [ZAP_POOL, parseUnits(amount, decimal)],
        });

        const tokenPrice = await getTokenPrice(selectedToken?.symbol!);

        transferIDRX({
          recipientAddress: sendData.address!,
          idrxAmount: Math.round(tokenPrice.priceIdr * Number(amount)),
        });
      })
      .catch((error) => {
        console.error("Error sending transaction:", error);
        alert("Error sending transaction: " + error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setIsNetworkDropdownOpen(false);
  };

  const handleTokenSelect = (token: Token) => {
    if (token.addresses.testnet) {
      setSelectedToken(token);
      setIsTokenDropdownOpen(false);
    }
  };

  const handleCopyAddress = () => {
    if (sendData.address) {
      navigator.clipboard.writeText(sendData.address);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\,/g, '');
    const newAmount = numericValue === '' ? undefined : Number(numericValue);
    
    setSendData({
      ...sendData,
      amount: newAmount,
    });
    
    if (value.includes(".")) {
      setFormattedAmount(value);
    } else {
      setFormattedAmount(formatNumber(value));
    }

    if (!newAmount) {
      return;
    }

    if (newAmount < parseFloat(limitData!.tokenLimits.minTokenAmount) || newAmount > parseFloat(limitData!.tokenLimits.maxTokenAmount)) {
      setIsValidAmount(false);
    } else {
      setIsValidAmount(true);
    }
  };

  return (
    <MobileLayout title={t("send.title") || "Send"} showAvatar>
      <style jsx global>{copyAnimationStyles}</style>
      
      <div className={`send-container ${theme}`}>
        {isLoadingTrf || isLoadingLimit ? (
          <div
            className="loading-spinner"
            style={{ alignSelf: "center" }}
          ></div>
        ) : (
          <form onSubmit={handleSubmit} className="send-form">
            <div className="send-form__field">
              <label className="field-label">
                {t("send.network") || "Select Network"}
              </label>
              <div className="networks-dropdown-container" ref={dropdownRef}>
                {isLoadingNetworks ? (
                  <div className="networks-loading" style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                    animation: 'pulse 1.5s infinite'
                  }}></div>
                ) : networks?.length === 0 ? (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    textAlign: 'center'
                  }}>
                    No networks available from API
                    <button
                      type="button"
                      onClick={() => {refetchNetworks()}}
                      style={{
                        display: 'block',
                        margin: '8px auto 0',
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="networks-dropdown" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {selectedNetwork && (
                          <>
                            <Image
                              width={'24'}
                              height={'24'}
                              src={selectedNetwork.logoUrl}
                              alt={selectedNetwork.name}
                              style={{
                                borderRadius: '50%',
                                marginRight: '10px'
                              }}
                            />
                            <span style={{ fontWeight: '500' }}>{selectedNetwork.name}</span>
                          </>
                        )}
                        {!selectedNetwork && <span>Select a network</span>}
                      </div>
                      <FaChevronDown style={{
                        transform: isNetworkDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease'
                      }} />
                    </button>

                    {isNetworkDropdownOpen && (
                      <div
                        className="networks-dropdown-options"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          maxHeight: '250px',
                          overflowY: 'auto'
                        }}
                      >
                        {networks?.map((network) => (
                          <div
                            key={network.id}
                            onClick={() => handleNetworkSelect(network)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: selectedNetwork?.id === network.id
                                ? (theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                                : 'transparent',
                              borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                            }}
                            className="network-dropdown-option"
                          >
                            <Image
                              width={'24'}
                              height={'24'}
                              src={network.logoUrl}
                              alt={network.name}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                marginRight: '10px'
                              }}
                            />
                            <span style={{ fontWeight: '500' }}>{network.name}</span>

                            {selectedNetwork?.id === network.id && (
                              <span style={{
                                marginLeft: 'auto',
                                color: theme === 'dark' ? '#3b82f6' : '#2563eb',
                                fontWeight: 'bold'
                              }}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedNetwork && (
              <div className="send-form__field">
                <label className="field-label">
                  {t("send.token") || "Select Token"}
                </label>
                <div className="tokens-dropdown-container" ref={tokenDropdownRef}>
                  {isLoadingTokens ? (
                    <div className="tokens-loading" style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                      animation: 'pulse 1.5s infinite'
                    }}></div>
                  ) : tokens?.length === 0 ? (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      textAlign: 'center'
                    }}>
                      No tokens available for this network
                      <button
                        type="button"
                        onClick={() => refetchTokens()}
                        style={{
                          display: 'block',
                          margin: '8px auto 0',
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                          cursor: 'pointer'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="tokens-dropdown" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                        style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {selectedToken && (
                            <>
                              <Image
                                width={'24'}
                                height={'24'}
                                src={selectedToken.logoUrl}
                                alt={selectedToken.symbol}
                                style={{
                                  borderRadius: '50%',
                                  marginRight: '10px'
                                }}
                              />
                              <div>
                                <span style={{ fontWeight: '500', display: 'block' }}>{selectedToken.symbol.toUpperCase()}</span>
                                {!selectedToken.addresses.testnet && (
                                  <span style={{ 
                                    fontSize: '10px', 
                                    color: theme === 'dark' ? '#ef4444' : '#b91c1c',
                                    display: 'block' 
                                  }}>
                                    Currently unavailable
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                          {!selectedToken && <span>Select a token</span>}
                        </div>
                        <FaChevronDown style={{ 
                          transform: isTokenDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease'
                        }} />
                      </button>
                      
                      <div 
                        className="tokens-dropdown-options"
                        style={{
                          maxHeight: isTokenDropdownOpen ? '250px' : '0',
                          overflow: 'hidden',
                          transition: 'max-height 0.3s ease-in-out',
                          marginTop: '4px',
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: isTokenDropdownOpen ? `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` : 'none',
                          opacity: isTokenDropdownOpen ? 1 : 0,
                          visibility: isTokenDropdownOpen ? 'visible' : 'hidden',
                          zIndex: 5
                        }}
                      >
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                          {tokens?.map((token) => (
                            <div
                              key={token.id}
                              onClick={() => handleTokenSelect(token)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                cursor: token.addresses.testnet ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s ease',
                                backgroundColor: 
                                  !token.addresses.testnet 
                                    ? (theme === 'dark' ? 'rgba(209, 78, 78, 0.1)' : 'rgba(239, 68, 68, 0.05)')
                                    : selectedToken?.id === token.id 
                                      ? (theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                                      : 'transparent',
                                borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                                opacity: token.addresses.testnet ? 1 : 0.6,
                              }}
                              className="token-dropdown-option"
                            >
                              <Image
                                width={'24'}
                                height={'24'}
                                src={token.logoUrl}
                                alt={token.symbol}
                                style={{
                                  borderRadius: '50%',
                                  marginRight: '10px'
                                }}
                              />
                              <div>
                                <span style={{ fontWeight: '500', display: 'block' }}>{token.symbol.toUpperCase()}</span>
                                {!token.addresses.testnet && (
                                  <span style={{ 
                                    fontSize: '10px', 
                                    color: theme === 'dark' ? '#ef4444' : '#b91c1c',
                                    display: 'block' 
                                  }}>
                                    Currently unavailable
                                  </span>
                                )}
                              </div>
                              
                              {selectedToken?.id === token.id && token.addresses.testnet && (
                                <span style={{ 
                                  marginLeft: 'auto',
                                  color: theme === 'dark' ? '#3b82f6' : '#2563eb',
                                  fontWeight: 'bold'
                                }}>✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sendData.address && (
              <div className="send-form__field">
                <label className="field-label">
                  {t("send.recipientAddress") || "Recipient Address"}
                </label>
                <div className={`address-display ${theme}`} style={{ 
                  padding: '12px 14px',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                  borderRadius: '8px',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className="address-text" style={{ 
                      fontFamily: 'monospace', 
                      fontWeight: '500',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-all',
                      fontSize: '14px'
                    }}>
                      {sendData.address.substring(0, 12)}...{sendData.address.substring(sendData.address.length - 4)}
                    </p>
                  </div>
                  
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={handleCopyAddress}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      }}
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                    
                    {isCopied && (
                      <div className={`copy-notification ${theme}`}>
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {qrType === "dynamic" && (
              <div className="send-form__field">
                <label className="field-label">
                  {t("send.amount") || "Amount"}
                </label>
                <div className={`amount-display ${theme}`}>
                  <p className="amount-text">
                    {t("send.idrxPrefix") || "IDRX"}{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "decimal",
                      currency: "IDR",
                    }).format(sendData?.amount as number)}
                  </p>
                </div>
              </div>
            )}

            {qrType === "static" && (
              <>
                <div className="send-form__field">
                  <label className="field-label" htmlFor="amount">
                    {t("send.amount") || "Amount"}
                  </label>
                  <div className="input-wrapper">
                    <div style={{
                      position: 'relative',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: theme === 'dark' ? '#6b7280' : '#4b5563'
                      }}>
                        {selectedToken?.symbol.toUpperCase()}
                      </div>
                      <input
                        id="amount"
                        type="text"
                        inputMode="numeric"
                        placeholder={t("send.enterAmount") || "Enter amount"}
                        value={formattedAmount}
                        onChange={handleAmountChange}
                        required
                        style={{
                          width: '100%',
                          padding: '14px 14px 14px 70px',
                          fontSize: '16px',
                          borderRadius: '8px',
                          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                          color: theme === 'dark' ? '#e5e7eb' : '#111827',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        }}
                        className={`amount-input ${theme}`}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme === 'dark' ? '#3b82f6' : '#2563eb';
                          e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                        }}
                      />
                    </div>
                    
                    <TransferLimit transferLimit={limitData} selectedToken={selectedToken!} />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={isSubmitting || !selectedNetwork || networks?.length === 0 || !selectedToken || !selectedToken.addresses.testnet || !isValidAmount}
              className="send-button"
            >
              { networks?.length === 0
                  ? "No Networks Available"
                  : !selectedToken
                    ? "Select a token to continue"
                    : !selectedToken.addresses.testnet
                      ? "Selected token not supported on testnet"
                      : t("send.sendButton") || "Send" }
            </Button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
}
