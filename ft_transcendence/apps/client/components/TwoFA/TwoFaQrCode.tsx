import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { api } from '@/api';
import { useRouter } from 'next/navigation';

export default function TwoFaQrCode() {
  const [qrCode, setQrCode] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    api.api().otp.getImage()
    .then(response => {
      if (response && response.data) {
        setQrCode(response.data as string);
      }
    })
    .catch(err => router.push("/"));
}, [router]);

  return (
    <div className="border rounded-lg w-full justify-center items-center flex py-2">
          <Image alt="qr-code" src={qrCode} width={240} height={240} className="w-[240px] h-[240px]" />
    </div>
  )
}
