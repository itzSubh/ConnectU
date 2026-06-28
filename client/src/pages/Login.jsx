import { Lock, Mail, Star, User2Icon } from 'lucide-react'
import React from 'react'
import {assets} from '../assets/assets'
import { SignIn } from '@clerk/react'


const Login = () => {

    const [state, setState] = React.useState("login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  return (
    <div className='flex min-h-screen flex-col md:flex-row bg-linear-to-r from-[#dfe2fe] via-[#b1cbfa] to-[#8e98f5]'>
    {/* Left side: Branding */}
    <div className='flex-1 flex flex-col items-start justify-between p-6 md:mt-10'>
          <h1 className='font-semibold flex cursor-pointer text-blue-800 text-3xl justify-center items-center '>Kaminey.in</h1>       
        <div>
            <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
                {/* <img src={assets.group_users} alt="" /> */}
                <div>
                    <div className='flex'>
                        {Array(5).fill(0).map((_,i)=> (<Star key={i} className='size-4 md:size-4.5 text-transparent fill-amber-500' />))}
                    </div>
                    <p>Used by 0+ users</p>
                </div>
            </div>
            <h1 className='text-3xl md:text-4xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'> <span className='text-red-600'>Uparwala:</span> Bolo vats kya chahiye?</h1>
            <h1 className='text-3xl md:text-4xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'><span className='text-orange-400'>Vats:</span> Bss ek baar meri baat kaminey se karwa do, plzzz <span className='text-yellow-50'>🙏</span></h1>
            <h1 className='text-3xl md:text-4xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'><span className='text-red-600'>Uparwala:</span> Jao vats login karoooo</h1>
            <p className='text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md'>Connect with Kaminey on Kaminey.in</p>
        </div>
        <span className='md:h-10'></span>
    </div>
    {/* Right side: Login form */}
    {/* <div className='flex flex-1 items-center justify-center min-h-screen '>
    <form onSubmit={handleSubmit} className="sm:w-87.5 w-full max-w-fit text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
        <p className="text-gray-500 text-sm mt-2">Please sign in to continue</p>
        {state !== "login" && (
            <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <User2Icon size={16} color='#6B7280'/>
                <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
            </div>
        )}
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Mail size={13} color='#6B7280' />
            <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Lock size={13} color='#6B7280' />
            <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="mt-4 text-left text-indigo-500">
            <button className="text-sm" type="reset">Forget password?</button>
        </div>
        <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity">
            {state === "login" ? "Login" : "Sign up"}
        </button>
        <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-indigo-500 hover:underline">click here</a></p>
    </form>
    </div> */}
    <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
        <SignIn />
    </div>
    </div>
  )
}

export default Login
