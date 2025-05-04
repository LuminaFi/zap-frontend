"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL, ETHEREUM_ADDRESS } from "../util/constant";
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

    calculateAmount(sendData.amount!).then((amount) => {
      sendTransaction({
        to: `${ETHEREUM_ADDRESS}` as AddressType,
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
