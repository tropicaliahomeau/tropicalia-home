
import { Metadata } from 'next';
import styles from './how-it-works.module.css';

export const metadata: Metadata = {
    title: 'How It Works | TropicaliaHome',
    description: 'Learn how our tropical lunch subscription service works.',
};

export default function HowItWorksPage() {
    return (
        <div className="bg-white pb-24">
            {/* Header Section */}
            <section className="bg-[#FFF8F0] py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A5D23]/5 rounded-full blur-3xl -ml-40 -mb-40"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="text-[#D4A373] font-bold tracking-wider uppercase text-sm mb-2 block">Simple Process</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 font-display">How It Works</h1>
                    <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
                        Getting delicious tropical lunches delivered to your workplace is easier than you think.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-dashed border-t-2 border-[#D4A373]/30 border-dashed z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#D4A373] shadow-lg mx-auto mb-6 border-4 border-white ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                                1
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Your Days</h3>
                            <p className="text-gray-600 px-4 leading-relaxed">
                                Choose exactly the meals you want—no subscriptions! Just place your order by <b>Friday Midnight</b>.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#D4A373] shadow-lg mx-auto mb-6 border-4 border-white ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                                2
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">We Cook Fresh</h3>
                            <p className="text-gray-600 px-4 leading-relaxed">
                                Our chefs prepare everything. <span className="block mt-2 text-[#4A5D23] font-medium bg-green-50 py-1 px-3 rounded-full inline-block">Important: Let us know if you have allergies!</span>
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-24 h-24 bg-[#4A5D23] rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg mx-auto mb-6 border-4 border-[#4A5D23] ring-1 ring-[#4A5D23]/30 transform scale-110 group-hover:rotate-12 transition-transform duration-300">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pickup or Delivery</h3>
                            <p className="text-gray-600 px-4 leading-relaxed">
                                Collect your meals on <b>Sundays (5 PM - 9 PM)</b> at Tropicalia (201 Ballarat Rd, Footscray). Or ask for home delivery.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg text-gray-800 mb-3 text-[#4A5D23]">When is the deadline?</h4>
                            <p className="text-gray-600">Orders must be placed by <b>Friday Midnight</b> to ensure we have fresh ingredients ready for the weekend prep.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg text-gray-800 mb-3 text-[#4A5D23]">Do I need a subscription?</h4>
                            <p className="text-gray-600">No! You can order for a single week or specific days without any long-term commitment. You are in control.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg text-gray-800 mb-3 text-[#4A5D23]">Delivery Options?</h4>
                            <p className="text-gray-600">We offer pickup at our Footscray location. If you need delivery, please contact us to arrange it for your area.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg text-gray-800 mb-3 text-[#4A5D23]">Allergies & Dietary?</h4>
                            <p className="text-gray-600">Please mention any allergies when registering. We clearly label all ingredients and can often accommodate specific requests.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
