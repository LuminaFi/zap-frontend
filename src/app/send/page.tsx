"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL, ETHEREUM_ADDRESS } from "../util/constant";
import { type BaseError, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import type { AddressType, calculateAmountResponse, QRTypes, SendData, TransferLimitResponse } from "./types";
import { Button } from "../components/Button";
import { useLanguage } from "../providers/LanguageProvider";
import { useTheme } from "../providers/ThemeProvider"; // We'll create this next

export default function SendPage() {
  const { t } = useLanguage();
  const { theme } = useTheme(); // Get current theme
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<Partial<SendData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  const { data: hash, error, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const address = search.get("address") as AddressType;
    const amount = Number(search.get("amount") as string);
    if (address) {
      setSendData({ address, amount });
    }
    setQRType(amount ? "dynamic" : "static");
  }, [search]);


  useEffect(() => {
    if (isConfirmed) {
      router.push("/account");
    }
  }, [isConfirmed, router]);

  const calculateAmount = async (amount: number) => {
    const transferLimitResponse = await fetch(`${BACKEND_URL}/transfer-limits`, {
      method: "GET",
    });
    const transferLimit: TransferLimitResponse = await transferLimitResponse.json();
    if (!transferLimit ||
      !transferLimit.success ||
      amount < parseFloat(transferLimit.minTransferAmount) ||
      amount > parseFloat(transferLimit.maxTransferAmount)) {
      throw new Error("Invalid transfer amount");
    }

    const calculateSourcesResponse = await fetch(`${BACKEND_URL}/calculate-source?token=ethereum&idrxAmount=${amount}`, {
      method: "GET",
    });
    const amountWithFee: calculateAmountResponse = await calculateSourcesResponse.json();
    if (!amountWithFee || !amountWithFee.success) {
      throw new Error("Failed to calculate amount");
    }

    return `${amountWithFee.fees.amountBeforeFees + amountWithFee.fees.totalFeeAmount}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    calculateAmount(sendData.amount!).then((amount) => {
      sendTransaction({
        to: `${ETHEREUM_ADDRESS}` as AddressType,
        value: parseEther(amount)
      });

      console.log("Transaction sent:", hash);
    }).catch((error) => {
      console.error("Error sending transaction:", error);
      alert("Error sending transaction: " + error.message);
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <MobileLayout title={t('send.title') || "Send"} showAvatar>
      <div className={`send-container ${theme}`}>
        <form onSubmit={handleSubmit} className="send-form">
          {sendData.address && (
            <div className="send-form__field">
              <label className="field-label">{t('send.recipientAddress') || "Recipient Address"}</label>
              <div className={`address-display ${theme}`}>
                <p className="address-text">{sendData.address}</p>
              </div>
            </div>
          )}

          {qrType === "dynamic" && (
            <div className="send-form__field">
              <label className="field-label">{t('send.amount') || "Amount"}</label>
              <div className={`amount-display ${theme}`}>
                <p className="amount-text">
                  {t('send.idrxPrefix') || "IDRX"}{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "decimal",
                    currency: "IDR",
                  }).format(sendData?.amount as number)}
                </p>
              </div>
            </div>
          )}

          {qrType === "static" && (
            <div className="send-form__field">
              <label className="field-label" htmlFor="amount">{t('send.amount') || "Amount"}</label>
              <div className="input-wrapper">
                <input
                  id="amount"
                  type="number"
                  placeholder={t('send.enterAmount') || "Enter amount"}
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
              </div>
            </div>
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
            disabled={isConfirming || isSubmitting}
            className="send-button"
          >
            {isConfirming ? (t('send.processing') || "Processing...") : (t('send.sendButton') || "Send")}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}