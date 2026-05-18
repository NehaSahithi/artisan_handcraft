import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Logged in successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron to-clay flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back!</h1>
        <p className="text-center text-gray-600 mb-6">Login to your Karigar account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-saffron"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-saffron font-bold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
