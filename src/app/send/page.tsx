"use client";

import { useEffect, useState, useRef } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL, ETHEREUM_ADDRESS } from "../util/constant";
import {
  type BaseError,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { DefaultError, useMutation, useQuery } from "@tanstack/react-query";
import type {
  AddressType,
  calculateAmountResponse,
  QRTypes,
  SendData,
  TransferIDRXPayload,
  TransferIDRXResponse,
  TransferLimitResponse,
} from "./types";
import { Button } from "../components/Button";
import { useLanguage } from "../providers/LanguageProvider";
import { useTheme } from "../providers/ThemeProvider"; // We'll create this next
import { FaChevronDown } from "react-icons/fa";

// Define Network interface
interface Network {
  id: string;
  name: string;
  icon: string;
}

const transfer = async ({
  recipientAddress,
  idrxAmount,
}: TransferIDRXPayload) => {
  const response = await fetch(`${BACKEND_URL}/meta-transfer`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: recipientAddress,
      idrxAmount: String(idrxAmount),
    }),
  });

  const data = await response.json();

  return {
    success: data.success,
    transferId: data.transferId,
    recipient: data.recipient,
    amount: data.amount,
    transactionHash: data.transactionHash,
  };
};

const getTransferLimit = async (): Promise<TransferLimitResponse> => {
  const transferLimitResponse = await fetch(`${BACKEND_URL}/transfer-limits`, {
    method: "GET",
  });
  return await transferLimitResponse.json();
};

// Function to fetch supported networks
const getSupportedNetworks = async (): Promise<Network[]> => {
  try {
    const response = await fetch('https://zap-service-jkce.onrender.com/api/supported-networks', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch networks: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle the response directly without providing mock data fallbacks
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // If the response is an object, try to find an array property
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        return possibleArrays[0] as Network[];
      }
    }
    
    // If we can't extract a network array, return an empty array
    // The UI will handle the empty state
    return [];
  } catch (error) {
    console.error('Error fetching networks:', error);
    // Return empty array instead of mock data
    return [];
  }
};

export default function SendPage() {
  const { t } = useLanguage();
  const { theme } = useTheme(); // Get current theme
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<Partial<SendData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  
  // Add state for networks
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);

  const { data: hash, error, sendTransaction } = useSendTransaction();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrorTrf,
  } = useWaitForTransactionReceipt({ hash });
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
  const {
    data: limitData,
    isLoading: isLoadingLimit,
    isSuccess: isLimitSuccess,
  } = useQuery<TransferLimitResponse>({
    queryKey: ["limit"],
    queryFn: getTransferLimit,
  });

  // Add dropdown state
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch supported networks on component mount
  useEffect(() => {
    const fetchNetworks = async () => {
      setIsLoadingNetworks(true);
      try {
        const networksData = await getSupportedNetworks();
        setNetworks(networksData);
        // Set first network as default selected
        if (networksData.length > 0) {
          setSelectedNetwork(networksData[0]);
        }
      } catch (err) {
        console.error('Error loading networks:', err);
      } finally {
        setIsLoadingNetworks(false);
      }
    };
    
    fetchNetworks();
  }, []);

  useEffect(() => {
    const address = search.get("address") as AddressType;
    const amount = Number(search.get("amount") as string);
    if (address) {
      setSendData({ address, amount });
    }
    setQRType(amount ? "dynamic" : "static");
  }, [search]);

  useEffect(() => {
    if (isConfirmed && !isErrorTrf) {
      transferIDRX({
        recipientAddress: sendData.address!,
        idrxAmount: sendData.amount!,
      });
    }
  }, [
    isConfirmed,
    sendData.address,
    sendData.amount,
    transferIDRX,
    isErrorTrf,
  ]);

  // Add click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateAmount = async (amount: number) => {
    if (
      !limitData ||
      !isLimitSuccess ||
      amount < parseFloat(limitData.minTransferAmount) ||
      amount > parseFloat(limitData.maxTransferAmount)
    ) {
      throw new Error("Invalid transfer amount");
    }

    const calculateSourcesResponse = await fetch(
      `${BACKEND_URL}/calculate-source?token=ethereum&idrxAmount=${amount}`,
      {
        method: "GET",
      }
    );
    const amountWithFee: calculateAmountResponse =
      await calculateSourcesResponse.json();
    if (!amountWithFee || !amountWithFee.success) {
      throw new Error("Failed to calculate amount");
    }

    return `${
      amountWithFee.fees.amountBeforeFees + amountWithFee.fees.totalFeeAmount
    }`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    calculateAmount(sendData.amount!)
      .then((amount) => {
        sendTransaction({
          to: `${ETHEREUM_ADDRESS}` as AddressType,
          value: parseEther(amount),
        });

        console.log("Transaction sent:", hash);
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
  };

  return (
    <MobileLayout title={t("send.title") || "Send"} showAvatar>
      <div className={`send-container ${theme}`}>
        {isLoadingTrf || isConfirming || isLoadingLimit ? (
          <div
            className="loading-spinner"
            style={{ alignSelf: "center" }}
          ></div>
        ) : (
          <form onSubmit={handleSubmit} className="send-form">
            {/* Networks dropdown selection */}
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
                ) : networks.length === 0 ? (
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
                      onClick={() => {
                        setIsLoadingNetworks(true);
                        getSupportedNetworks().then(data => {
                          setNetworks(data);
                          setIsLoadingNetworks(false);
                        });
                      }}
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
                            <img 
                              src={selectedNetwork.icon} 
                              alt={selectedNetwork.name}
                              style={{
                                width: '24px',
                                height: '24px',
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
                        {networks.map((network) => (
                          <div
                            key={network.id}
                            onClick={() => {
                              handleNetworkSelect(network);
                              setIsNetworkDropdownOpen(false);
                            }}
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
                            <img 
                              src={network.icon} 
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
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
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
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText(sendData.address || '');
                      alert('Address copied to clipboard');
                    }}
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
                    Copy
                  </button>
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
                    <input
                      id="amount"
                      type="number"
                      placeholder={t("send.enterAmount") || "Enter amount"}
                      value={sendData.amount || ""}
                      onChange={(e) =>
                        setSendData({
                          ...sendData,
                          amount: Number(e.target.value ?? 0),
                        })
                      }
                      required
                      className={`amount-input ${theme}`}
                    />
                    
                    <div className="transfer-limits-container" style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}>
                      <div className="transfer-limit-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Max. Transfer Amount:</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(parseFloat(limitData?.minTransferAmount || "0"))} IDRX
                        </span>
                      </div>
                      <div className="transfer-limit-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Min. Transfer Amount:</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(parseFloat(limitData?.maxTransferAmount || "0"))} IDRX
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className={`error-message ${theme}`}>
                {(error as BaseError).shortMessage || error.message}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={isConfirming || isSubmitting || !selectedNetwork || networks.length === 0}
              className="send-button"
            >
              {isConfirming
                ? t("send.processing") || "Processing..."
                : networks.length === 0 
                    ? "No Networks Available" 
                    : t("send.sendButton") || "Send"}
            </Button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
}
