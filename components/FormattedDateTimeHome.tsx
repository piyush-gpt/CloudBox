import { cn, formatDateTimeHome } from '@/lib/utils'
import React from 'react'

const FormattedDateTimeHome = ({date, className}:{date:string, className?:string}) => {
  return (
    <p className={cn("body-1 text-light-200",className)}>{formatDateTimeHome(date)}</p>
  )
}

export default FormattedDateTimeHome