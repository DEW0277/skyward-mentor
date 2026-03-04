import React from "react";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Standart",
    description: "Boshlang'ich darajadagi foydalanuvchilar uchun",
    price: "95,000",
    features: [
      "Kitobdan 6 oy davomida foydalanish",
      "Qo'shimcha materiallardan 6 oy foydalanish",
    ],
    highlighted: false,
    buttonText: "Xarid qilish",
  },
  {
    name: "Pro",
    description: "To'liq ustunlikka ega bo'lishni xohlovchilar uchun",
    price: "195,000",
    features: [
      "Kitob va qo'shimcha materiallardan 6 oy foydalanish",
      "O'z CVingizni mutaxassislarga tekshirtirib olish",
      "Oyning 14-15 sanalarida yopiq onlayn ko'rishish",
      "Yopiq Telegram tayyorlov kanaliga a'zo bo'lish",
    ],
    highlighted: true,
    buttonText: "A'zo bo'lish",
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden" id="pricing">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-medium text-sm mb-4">
            <Star className="w-4 h-4" />
            <span>Tariflarimiz</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            O'zingizga mos tarifni tanlang
          </h2>
          <p className="text-lg text-gray-600">
            Bilim va imkoniyatlaringizni kengaytirish uchun eng maqbul takliflar
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col w-full max-w-md rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-white border-2 border-primary shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] md:-mt-4 md:mb-4 z-10 scale-100 md:scale-105"
                  : "bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] mt-0"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Eng Ommabop
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-xl font-semibold ml-1"> UZS</span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check
                      className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-primary" : "text-green-500"}`}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/purchase")}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                    : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
