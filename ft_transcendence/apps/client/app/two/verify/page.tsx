"use client"
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import QRExample from 'assets-workspace/images/Example-QR-code.webp';
import Image from 'next/image';
import { api } from '@/api';
import { useRouter } from 'next/navigation';
import TwoFaQrCode from '@/components/TwoFA/TwoFaQrCode';
import TwoFaOtp from '@/components/TwoFA/TwoFaOtp';

export default function Page() {

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();
  const verifyOtp = async (code:string) => {
    try {
      const result = await api.api().otp.verifyOtp(code);
      if(result.data)
      {
        router.push('/setting')
      }
      else 
      {
        setError(true)
      }
    }
    catch(err)
    {
      setError(true)
    }

  }

  const handleOnStart = (): void => {
    // Implement the logic for handling the "Start" button click
    if (otp.some((digit) => digit === '')) {
      setError(true); // Set error if OTP is not complete
    } else {
      verifyOtp(otp.join(""));
      setError(false);
      // Implement your logic to handle the successful OTP entry

    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="bg-white p-[40px] flex flex-col justify-center items-center gap-4 rounded-xl">
        <div className="w-full flex flex-col justify-center items-center gap-2">
          <h2 className="text-black font-bold text-2xl uppercase">Two Factor Authentication</h2>
          <h5 className="text-gray-600 font-light text-lg">Verify the two-factor code before login</h5>
        </div>
        <TwoFaQrCode />
        <TwoFaOtp otp={otp} setOtp={setOtp} error={error} setError={setError} />
        <button className="w-full rounded-lg px-40 py-3 bg-[#b9ef72]" onClick={handleOnStart}>
          submit
        </button>
        <button className="w-full rounded-lg px-40 py-3 bg-red-500 text-white" onClick={() => {router.push("/setting")}}>Ignore</button>
      </div>
    </div>
  );
}
