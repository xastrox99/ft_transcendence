import React from 'react'
import Image from 'next/image';
import Link from 'next/link';

type userProps = {
  login: string;
  profileImage: string
  score: Number
}

type Props = {
  user1: userProps;
  user2: userProps
}

function HistoryCard({ user1, user2, }: Props) {
  const scor = user1.score + ' : ' + user2.score;
  return (
    <div className='w-full h-14  m-0.5  bg-[#ffffff1a] grid grid-cols-3 justify-items-center rounded-xl    '>
      <div className='flex gap-2  text-white items-center'>
        <Image width={35} height={35} className='rounded-full w-11 h-11' src={user1.profileImage} alt={user1.login} />
        <span  className=' md:text-base text-xs'>
          {user1.login}
        </span>
      </div>
      <span className='text-white flex font-bold self-center'>{scor}</span>
      <div className='flex gap-1 text-white items-center'>
        <span  className=' md:text-base text-xs'>
          {user2.login}
        </span>
        <Image width={35} height={35} className='rounded-full mr-2 h-11 w-11' src={user2.profileImage} alt={user2.login} />
      </div>
    </div>
  )
}

export default HistoryCard



