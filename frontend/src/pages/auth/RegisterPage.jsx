import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'artisan']),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, loading } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' },
  })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Registered successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay to-terracotta flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Join Karigar</h1>
        <p className="text-center text-gray-600 mb-6">Create your account to get started</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">I am a...</label>
            <select
              {...register('role')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
            >
              <option value="buyer">Buyer</option>
              <option value="artisan">Artisan (Seller)</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Full Name</label>
            <input
              {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="Your name"
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Phone (10 digits)</label>
            <input
              {...register('phone')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="9876543210"
            />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="••••••"
            />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="••••••"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-saffron font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
