import React, { useRef, useState, KeyboardEvent } from "react";

export default function TwoFaOtp(props: {otp: string[], setOtp: any, error: boolean, setError: any}) {
  const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

  const changeOtp = (index: number, value: string): void => {
    props.setError(false); // Reset error when OTP changes
    const newOTP: string[] = [...props.otp];
    newOTP[index] = value.substring(value.length - 1);
    props.setOtp(newOTP);
    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleOnFocus = (index: number): void => {
    props.setError(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    const { key } = e;
    if (key === '-' || key === '+' || key === 'e' || key === '.') {
      e.preventDefault();
    }
    if (key === 'Backspace' && e.currentTarget === document.activeElement) {
      // Handle Backspace key
      const index = inputRefs.findIndex((ref) => ref?.current === document.activeElement);
      if (index > 0) {
        props.otp[index] = '';
        inputRefs[index - 1]?.current?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col justify-start gap-4 py-8">
      <div className="w-full h-20 flex flex-row gap-2">
        {props.otp.map((_, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="number"
            className={`border border-gray-400 rounded-lg h-full w-16 text-center text-2xl text-black focus:border-[#b9ef72] ${
              props.otp[index] && "border-[#b9ef72]"
            } ${props.error && "border-red-500 text-red-500"}`}
            value={props.otp[index]}
            onChange={(e) => changeOtp(index, e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => handleOnFocus(index)}
          />
        ))}
      </div>
      {props.error && (
        <p className="text-sm font-light text-red-500">
          Please enter a valid OTP
        </p>
      )}
    </div>
  );
}
