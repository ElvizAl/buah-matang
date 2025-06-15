"use client"
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'


export const LoginButton = () => {
    const {pending} = useFormStatus();

  return (
    <Button type="submit" className='w-full cursor-pointer'>{pending ? 'Logging in...' : 'Login'}</Button>
  )
}


export const RegisterButton = () => {
    const {pending} = useFormStatus();

  return (
    <Button type="submit" className='w-full cursor-pointer'>{pending ? 'Registering...' : 'Register'}</Button>
  )
}