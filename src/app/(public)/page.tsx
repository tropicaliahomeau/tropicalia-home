import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/hero-hd.jpg"
            alt="Tropicalia Home Latin Food"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Taste the Tropics <br /> Every Single Day
          </h1>
          <p className={styles.heroSubtitle}>
            Fresh, healthy, and vibrant lunches ready for you to pick up and enjoy.
            Experience the joy of culinary paradise with our flexible weekly subscriptions.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/menu" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              View Weekly Menu
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary" style={{ fontSize: '1.2rem', padding: '1rem 2rem', color: 'white', borderColor: 'white' }}>
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[#4A5D23] font-bold tracking-wider uppercase text-sm mb-2 block">Tropicalia Experience</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-display">Why Choose TropicaliaHome?</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We bring the vacation vibes to your lunch break with meals that are healthy, hearty, and full of flavor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group bg-gray-50 rounded-[2rem] p-8 hover:bg-[#4A5D23] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                🥑
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-white">Fresh Ingredients</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-green-50">
                Meals prepared with fresh ingredients and authentic Latin flavor. No preservatives, just homemade taste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gray-50 rounded-[2rem] p-8 hover:bg-[#4A5D23] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                🛍️
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-white">We Organize Your Delivery</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-green-50">
                Pick up your <b>Weekly Meal</b> at Tropicalia Latin Food (201 Ballarat Road, Footscray) or we can arrange home delivery.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gray-50 rounded-[2rem] p-8 hover:bg-[#4A5D23] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-white">No Plans, No Commitments</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-green-50">
                Order only on the days you want. You decide when to eat at Tropicalia with no strings or contracts attached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#FFF8F0] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A5D23]/5 rounded-full blur-3xl -ml-40 -mb-40"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#D4A373] font-bold tracking-wider uppercase text-sm mb-2 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Getting your tropical lunch sorted is as easy as 1-2-3. No stress, just delicious food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-dashed border-t-2 border-[#D4A373]/30 border-dashed z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#D4A373] shadow-lg mx-auto mb-6 border-4 border-white ring-1 ring-gray-100">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Select Your Days</h3>
              <p className="text-gray-600 px-4">
                Choose exactly the meals you want—no subscriptions! Just place your order by <b>Friday Midnight</b>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#D4A373] shadow-lg mx-auto mb-6 border-4 border-white ring-1 ring-gray-100">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">We Cook Fresh</h3>
              <p className="text-gray-600 px-4">
                Our chefs prepare everything. <b>Important:</b> When you sign up, please let us know if you have any allergies!
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-[#4A5D23] rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg mx-auto mb-6 border-4 border-[#4A5D23] ring-1 ring-[#4A5D23]/30 transform scale-110">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Pickup or Delivery</h3>
              <p className="text-gray-600 px-4">
                Collect your meals on <b>Sundays (5 PM - 9 PM)</b> at Tropicalia (201 Ballarat Rd, Footscray). Or ask for home delivery.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/menu" className="inline-block bg-[#4A5D23] text-white font-bold py-4 px-10 rounded-full hover:bg-[#3a491c] transition-all transform hover:scale-105 shadow-xl shadow-green-900/20">
              Start My Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* Marketing & Conversion: Come gratis con Tropicalia */}
      <section className="bg-[#4A5D23] py-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Eat for free with Tropicalia</h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90">
            Your passion for Latin flavor is rewarded. <br className="hidden md:block" />
            Discover how your network of friends can unlock free weeks of food.
          </p>
        </div>
      </section>
    </div>
  );
}
