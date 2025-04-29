"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useRouter, useSearchParams } from "next/navigation";

type QRTypes = "static" | "dynamic";

interface SendData {
  address?: string;
  amount?: number;
}

export default function SendPage() {
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<SendData>({});
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const address = search.get("address") as string;
    const amount = Number(search.get("amount") as string);
    if (address) {
      setSendData({ address, amount });
    }
    setQRType(amount ? "dynamic" : "static");
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending transaction:", sendData);
    router.push("/account");
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

          <button type="submit" className="send-form__submit">
            Send
          </button>
        </form>
      </div>
    </MobileLayout>
  );
}
