import React from 'react'

export default function SenderLayout({msg}: {msg: string}) {
  return (
    <div
        className=" h-max w-max max-w-[50%] p-2 rounded-xl bg-[#b9ef72] self-end break-all">
        <span>{msg}</span>
    </div>
  )
}
