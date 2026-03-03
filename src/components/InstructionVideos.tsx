import React from "react";
import { PlayCircle } from "lucide-react";

const videos = [
  {
    title: "Saytdan qanday ro'yxatdan o'tish",
    description:
      "Platformamizdan ro'yxatdan o'tish va ilk qadamlar haqida batafsil ma'lumot.",
    videoId: "_KlotsljQDo",
  },
  {
    title: "Dashboarddan foydalanish",
    description:
      "To'lovni amalga oshirgandan so'ng, admin tasdiqlagan foydalanuvchilar uchun shaxsiy kabinetdan foydalanish bo'yicha qo'llanma.",
    videoId: "0IUYW158ZLM",
  },
];

const InstructionVideos = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-medium text-sm mb-4">
            <PlayCircle className="w-4 h-4" />
            <span>Video Qo'llanmalar</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Platformadan Foydalanish
          </h2>
          <p className="text-lg text-gray-600">
            Tizimdan qulay va samarali foydalanish uchun maxsus tayyorlangan
            video yo'riqnomalar bilan tanishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 max-w-6xl mx-auto">
          {videos.map((video, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="relative pt-[56.25%] overflow-hidden bg-gray-100">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructionVideos;
