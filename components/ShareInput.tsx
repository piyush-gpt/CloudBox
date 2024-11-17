import React from 'react'

interface Props{
    file:any,
    onInputChange:React.Dispatch<React.SetStateAction<never[]>>,
    onRemove:(email:string)=> void
}

const ShareInput = ({file, onInputChange, onRemove}:Props) => {
  return (
    <div>ShareInput</div>
  )
}

export default ShareInput