"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "../util/constant";
import { type BaseError, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import type { AddressType, calculateAmountResponse, QRTypes, SendData, TransferLimitResponse } from "./types";

export default function SendPage() {
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<Partial<SendData>>({});
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

  const mockCalculateAmount = async (amount: number) => {
    const amountWithFee = {
      "success": true,
      "token": "ethereum",
      "sourceAmount": 0.2285,
      "sourceAmountFormatted": "0.22850000 ETH",
      "idrxAmount": 10000000,
      "idrxAmountFormatted": "Rp 10.000.000",
      "fees": {
        "token": "ethereum",
        "tokenSymbol": "ETH",
        "priceUsd": 2835.42,
        "priceIdr": 43949010,
        "adminFeePercentage": 0.005,
        "adminFeeAmount": 0.00114,
        "spreadFeePercentage": 0.002,
        "spreadFeeAmount": 0.00046,
        "totalFeePercentage": 0.007,
        "totalFeeAmount": 0.0016,
        "amountBeforeFees": 0.2285,
        "amountAfterFees": 0.2269,
        "exchangeRate": 43949010,
        "timestamp": 1681234567890,
        "adminFeePercentageFormatted": "0.50%",
        "spreadFeePercentageFormatted": "0.20%",
        "totalFeePercentageFormatted": "0.70%"
      }
    }

    return `${amountWithFee.fees.amountAfterFees}`;
  }

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

    const calculateSourcesResponse = await fetch(`${BACKEND_URL}/calculate-sources`, {
      method: "GET",
    });
    const amountWithFee: calculateAmountResponse = await calculateSourcesResponse.json();
    if (!amountWithFee || !amountWithFee.success) {
      throw new Error("Failed to calculate amount");
    }

    return `${amountWithFee.fees.amountAfterFees}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mockCalculateAmount(sendData.amount!).then((amount) => {
      sendTransaction({
        to: sendData.address,
        value: parseEther(amount)
      });

      console.log("Transaction sent:", hash);
    }).catch((error) => {
      console.error("Error sending transaction:", error);
      alert("Error sending transaction: " + error.message);
    });
  };

  return (
    <MobileLayout title="Send" showAvatar>
      <div className="send-container">
        <form onSubmit={handleSubmit} className="send-form">
          {sendData.address && (
            <div className="send-form__address">
              <label>Recipient Address</label>
              <p>{sendData.address}</p>
            </div>
          )}
          {qrType === "dynamic" && (
            <div className="send-form__address">
              <label>Amount</label>
              <p>
                IDRX{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  currency: "IDR",
                }).format(sendData?.amount as number)}
              </p>
            </div>
          )}

          {qrType === "static" && (
            <>
              <div className="send-form__amount">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={sendData.amount || ""}
                  onChange={(e) =>
                    setSendData({
                      ...sendData,
                      amount: Number(e.target.value ?? 0),
                    })
                  }
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="send-form__submit" disabled={isConfirming}>
            Send
          </button>

          {error && (
            <div>Error: {(error as BaseError).shortMessage || error.message}</div>
          )}
        </form>
      </div>
    </MobileLayout>
  );
}
