"use client";

import { useEffect, useState } from "react";
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

export default function SendPage() {
  const { t } = useLanguage();
  const { theme } = useTheme(); // Get current theme
  const [qrType, setQRType] = useState<QRTypes>("static");
  const [sendData, setSendData] = useState<Partial<SendData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

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
            {sendData.address && (
              <div className="send-form__field">
                <label className="field-label">
                  {t("send.recipientAddress") || "Recipient Address"}
                </label>
                <div className={`address-display ${theme}`}>
                  <p className="address-text">{sendData.address}</p>
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
                    <p style={{ marginTop: 15 }}>
                      Max. Transfer Amount: {limitData?.minTransferAmount}
                    </p>
                    <p style={{ marginTop: 5 }}>
                      Min. Transfer Amount: {limitData?.maxTransferAmount}
                    </p>
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
              disabled={isConfirming || isSubmitting}
              className="send-button"
            >
              {isConfirming
                ? t("send.processing") || "Processing..."
                : t("send.sendButton") || "Send"}
            </Button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
}
