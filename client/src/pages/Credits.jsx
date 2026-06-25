import React, { useEffect, useState } from 'react'
import { dummyPlans } from '../assets/assets'
import Loading from './Loading'

function Credits() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPlans(dummyPlans)
    setLoading(false)
  }, [])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] px-6 py-10">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h2>

        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Select a plan and start generating amazing AI images.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative flex flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
              ${
                plan._id === 'pro'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1c]'
              }`}
            >
              {/* Badge */}
              {plan._id === 'pro' && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}

              {plan._id === 'premium' && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="my-5">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  ${plan.price}
                </span>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {plan.credits} Credits
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                className={`mt-auto w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300
                ${
                  plan._id === 'pro'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105'
                    : 'bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                Buy Now
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}

export default Credits