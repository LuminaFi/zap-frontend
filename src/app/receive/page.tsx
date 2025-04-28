"use client";

import { useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { Button } from "../components/Button";
import { QRCode } from "react-qrcode-logo";
import { FormField } from "../components/FormField";

export default function ReceivePage() {
  const [isDynamic, setIsDynamic] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  return (
    <MobileLayout title="Receive" showAvatar>
      <div className="receive-container">
        {!isDynamic ? (
          <div className="qr-container">
            <QRCode
              value={JSON.stringify({
                address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
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
        {isDynamic && !isSubmitted ? (
          <>
            <FormField
              label="Amount"
              type="number"
              onChange={(event) => setAmount(Number(event.target.value ?? 0))}
            />
            <Button onClick={() => setIsSubmitted(true)}>Submit</Button>
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
                  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
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
