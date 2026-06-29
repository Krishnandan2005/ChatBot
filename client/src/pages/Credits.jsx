import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

function Credits() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, axios } = useAppContext();

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/credit/plan', {
        headers: { Authorization: token },
      });
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error(data.message || "Failed to fetch plans");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post('/api/credit/purchase', { planId }, {
        headers: { Authorization: token },
      });
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <Loading />;

  return (
    <section className="min-h-screen bg-white dark:bg-[#111111] px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select the perfect plan for your AI journey.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {plans.map((plan) => (
            <article
              key={plan._id}
              className={`relative flex flex-col w-full max-w-[310px] min-h-[420px] rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
              ${
                plan._id === "pro"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1b1b1b]"
              }`}
            >
              {/* Badge */}
              {plan._id === "pro" && (
                <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 text-[10px] font-semibold text-white">
                  MOST POPULAR
                </span>
              )}

              {plan._id === "premium" && (
                <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 text-[10px] font-semibold text-white">
                  BEST VALUE
                </span>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="my-5">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent">
                  ${plan.price}
                </span>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {plan.credits} Credits
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 flex flex-col gap-3">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Buy Button */}
              <button
                onClick={() => purchasePlan(plan._id)}
                className={`mt-6 w-full rounded-xl py-3 text-base font-semibold transition-all duration-300
                ${
                  plan._id === "pro"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105"
                    : "bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90"
                }`}
              >
                Buy Now
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Credits;
