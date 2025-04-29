"use client";

import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QRResult = {
  address?: string;
  amount?: number;
};

const basicEthAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const isValidEthereumAddress = (address: string) => {
  if (!basicEthAddressRegex.test(address)) {
    return false;
  }

  if (/[a-f]/.test(address) && /[A-F]/.test(address)) {
  }

  return true;
};

const updateBorder = () => {
  const svgElement = document.querySelector("svg") as SVGSVGElement;
  const videoEl = document?.querySelector?.("video") as HTMLElement;
  const videoContainerEl = document?.querySelector?.("video")
    ?.parentElement as HTMLElement;

  videoEl.style.borderRadius = "10px";
  videoEl.style.height = "unset";

  videoContainerEl.style.height = "unset";
  videoContainerEl.style.width = "350px";

  svgElement?.remove?.();
};

export default function ScanQRPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    updateBorder();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleScan = (result: IDetectedBarcode[]) => {
    const qrRes = JSON.parse(result[result.length - 1].rawValue) as QRResult;
    if (isValidEthereumAddress(qrRes?.address ?? "")) {
      router.push(
        `/send?address=${qrRes?.address}${
          qrRes?.amount ? `&amount=${qrRes?.amount}` : ""
        }`
      );
    } else {
      alert("Invalid address, please scan again");
    }
  };

  return (
    <div className="scan-container">
      <div className="scan-area">
        <h1>Scan QR</h1>
        <div className="qr-scanner__frame">
          <Scanner
            allowMultiple
            onScan={handleScan}
            styles={{
              container: {
                visibility: isLoading ? "hidden" : "visible",
              },
              finderBorder: 0,
            }}
          />
        </div>
        <p>Please scan the QR code</p>
      </div>
    </div>
  );
}
