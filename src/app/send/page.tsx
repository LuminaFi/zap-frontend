"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";

type QRTypes = "static" | "dynamic";

interface SendData {
  address?: string;
  amount?: string;
}

export default function SendPage() {
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<SendData>({});
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const address = search.get("address") as string;
    if (address) {
      setSendData({ address });
      setQRType("static");
    }
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending transaction:", sendData);
    router.push("/account");
  };

  return (
    <MobileLayout title="Send" showAvatar>
      <div className="send-container">
        {qrType === "dynamic" && (
          <div className="send-options">something here</div>
        )}

        {qrType === "static" && (
          <form onSubmit={handleSubmit} className="send-form">
            {sendData.address && (
              <div className="send-form__address">
                <label>Recipient Address</label>
                <p>{sendData.address}</p>
              </div>
            )}
            <div className="send-form__amount">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={sendData.amount || ""}
                onChange={(e) =>
                  setSendData({ ...sendData, amount: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="send-form__submit">
              Send
            </button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
}
