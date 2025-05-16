"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/Button";
import { QRCode } from "react-qrcode-logo";
import { FormField } from "@/components/FormField";
import { TransferLimit } from "@/components/TransferLimit";
import { useQuery } from "@tanstack/react-query";
import { TransferLimitResponse } from "@/app/send/types";
import { getTransferLimit } from "@/utils/getTransferLimit";
import { formatNumber } from "@/utils/formatNumber";
import { useAccount } from "wagmi";
import { idrxTokenMetadata } from "@/utils/constant";

export default function ReceivePage() {
  const { address } = useAccount();
  const [isDynamic, setIsDynamic] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(false);

  const {
    data: limitData,
    isLoading: isLoadingLimit,
  } = useQuery<TransferLimitResponse>({
    queryKey: [`limit-${idrxTokenMetadata.symbol}`],
    queryFn: () => getTransferLimit(),
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    const numericValue = value.replace(/\,/g, '');
    const newAmount = numericValue === '' ? undefined : Number(numericValue);
    
    setAmount(newAmount || 0);
    
    if (value.includes(".")) {
      setFormattedAmount(value);
    } else {
      setFormattedAmount(formatNumber(value));
    }

    if (!newAmount) {
      return;
    }

    if (newAmount < parseFloat(limitData!.minTransferAmount) || newAmount > parseFloat(limitData!.maxTransferAmount)) {
      setIsValidAmount(false);
    } else {
      setIsValidAmount(true);
    }
  };

  return (
    <MobileLayout title="Receive" showAvatar>
      <div className="receive-container">
        {!isDynamic ? (
          <div className="qr-container">
            <QRCode
              value={JSON.stringify({
                address: address,
              })}
              qrStyle="dots"
              eyeRadius={10}
              logoImage="./zap-logo.png"
              logoHeight={70}
              logoWidth={70}
              quietZone={0}
              logoPaddingStyle="circle"
              fgColor="#18A0CA"
              // removeQrCodeBehindLogo
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        ) : null}

        {isDynamic && isLoadingLimit ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="loading-spinner"
              style={{ alignSelf: "center" }}
            />
          </div>  
        ) : null}

        {isDynamic && !isSubmitted && !isLoadingLimit ? (
          <>
            <div style={{
              position: 'relative',
              marginBottom: '16px'
            }}>
              <FormField
                label="Amount"
                type="string"
                value={formattedAmount}
                onChange={handleAmountChange}
              />
              <TransferLimit transferLimit={limitData} selectedToken={idrxTokenMetadata} />
            </div>

            <Button 
            onClick={() => setIsSubmitted(true)}
            disabled={!isValidAmount}
            className="send-button"
            
            >Submit</Button>
          </>
        ) : null}
        {!isDynamic && !isSubmitted ? (
          <Button onClick={() => setIsDynamic(!isDynamic)}>Input Amount</Button>
        ) : null}
        {amount > 0 && isSubmitted ? (
          <>
            <div className="qr-container">
              <QRCode
                value={JSON.stringify({
                  amount,
                  address: address,
                })}
                qrStyle="dots"
                eyeRadius={10}
                logoImage="./zap-logo.png"
                logoHeight={70}
                logoWidth={70}
                quietZone={0}
                logoPaddingStyle="circle"
                fgColor="#18A0CA"
                // removeQrCodeBehindLogo
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <div className="amount-display">
              <p style={{ marginBottom: 5 }}>You&apos;re about to receive:</p>
              <p className="amount">
                IDRX{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  currency: "IDR",
                }).format(amount)}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </MobileLayout>
  );
}
