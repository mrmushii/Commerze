import { Leaf, Smile, Sparkles } from 'lucide-react'
import React from 'react'

const Advertise = () => {
  return (
   <section className="my-12 p-8 pb-14 bg-white rounded-2xl shadow-lg text-center border border-gray-200">
      <h2 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-wide">
        Quality & Style Guaranteed
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
        At <span className="font-semibold text-blue-600">Commerze</span>, we believe in combining comfort with the latest fashion. Our curated collection ensures you always look your best.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {/* Feature 1 */}
        <div className="p-6 py-16 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left">
          <div className="flex items-center mb-4 text-blue-600">
            <Leaf className="w-6 h-6 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Sustainable Fashion</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Committed to eco-friendly materials and ethical production.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 py-16 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left">
          <div className="flex items-center mb-4 text-blue-600">
            <Sparkles className="w-6 h-6 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Expertly Curated</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Hand-picked styles to keep you ahead of the trends.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 py-16 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left">
          <div className="flex items-center mb-4 text-blue-600">
            <Smile className="w-6 h-6 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Customer Satisfaction</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Your happiness is our priority, with easy returns and support.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Advertise