import { User } from '@/types';
import React from 'react'

type Props = {
    userProfile: User | undefined;
}

const Saved = ({userProfile} : Props) => {
  return (
    <div>Saved</div>
  )
}

export default Saved;