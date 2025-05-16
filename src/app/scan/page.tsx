"use client";

import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/MobileLayout";
import { BiQrScan } from 'react-icons/bi';
import { QRResult } from "./types";
import { isValidWalletAddress } from "@/utils/isValidWalletAddress";

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
    if (isValidWalletAddress(qrRes?.address ?? "")) {
      router.push(
        `/send?address=${qrRes?.address}${qrRes?.amount ? `&amount=${qrRes?.amount}` : ""
        }`
      );
    } else {
      alert("Invalid address, please scan again");
    }
  };

  return (
    <MobileLayout title="Scan QR" showAvatar>
      <div className="scan-container">
        <div className="scan-area">
          <div className="scan-icon">
            <BiQrScan size={32} color="#0066ff" />
          </div>
          <div className="qr-scanner__frame">
            <Scanner
              allowMultiple
              onScan={handleScan}
              styles={{
                container: {
                  visibility: isLoading ? "hidden" : "visible",
                  position: "relative",
                  width: "100%",
                  maxWidth: "350px",
                  height: "350px",
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                },
                finderBorder: 0,
              }}
            />
          </div>
          <p>Please scan the QR code</p>
        </div>
      </div>
    </MobileLayout>
  );
}
