import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import CountUp from "../components/CountUp";
import { 
  BookOpen, 
  Users, 
  Award, 
  Rocket, 
  CheckCircle,
  Layout,
  Clock,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    courses: 0,
    lectures: 0,
    satisfaction: 98
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats/public");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
    return num;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 pt-16 pb-24 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              NEW: Advanced LMS Features Now Available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-950 dark:text-white leading-[1.1] mb-8 tracking-tight">
              Master Any Skill with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Acadify</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl">
              The modern learning management system designed for speed, efficiency, and real-world results. Join thousands of students today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                Get Started for Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/lms" 
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
              >
                Explore Courses
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale dark:invert">
              {/* Fake Partners for Visuals */}
              <div className="font-black text-2xl tracking-tighter">STRIPE</div>
              <div className="font-black text-2xl tracking-tighter">VITE</div>
              <div className="font-black text-2xl tracking-tighter">REACT</div>
              <div className="font-black text-2xl tracking-tighter">TAILWIND</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-950 dark:text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Acadify provides the tools for both instructors and students to thrive in a digital learning environment.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Layout,
              title: "Expert Dashboard",
              desc: "Manage your courses, track student progress, and analyze revenue with our powerful analytics suite."
            },
            {
              icon: Rocket,
              title: "Rapid Learning",
              desc: "Optimized video delivery and clean UI ensures you stay focused on what matters: the content."
            },
            {
              icon: Users,
              title: "Community Growth",
              desc: "Engage with students via comments, reviews, and interactive course sections."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-950 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 opacity-50" />
        <div className="container mx-auto px-6 relative grid md:grid-cols-4 gap-12 text-center text-white">
          <div>
            <div className="text-5xl font-black mb-2">
              <CountUp end={stats.students} suffix="+" />
            </div>
            <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">Students</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">
              <CountUp end={stats.instructors} suffix="+" />
            </div>
            <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">Instructors</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">
              <CountUp end={stats.satisfaction} suffix="%" />
            </div>
            <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">Satisfaction</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">
              <CountUp end={stats.courses} suffix="+" />
            </div>
            <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">Courses</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-950 flex justify-center">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
             
             <h2 className="text-4xl md:text-5xl font-black mb-8 relative">Ready to start your journey?</h2>
             <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative opacity-90">Join the thousands of learners who are already transforming their lives with Acadify.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
               <Link to="/register" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Create Free Account</Link>
               <Link to="/lms" className="px-10 py-5 bg-blue-500/20 text-white border border-white/20 rounded-2xl font-black hover:bg-blue-500/30 transition-all backdrop-blur-sm">View All Courses</Link>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
            <span className="font-black text-xl text-gray-950 dark:text-white">Acadify</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© 2026 Acadify LMS. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-bold text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
