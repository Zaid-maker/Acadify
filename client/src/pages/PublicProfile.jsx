import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import { User, Mail, Globe, MapPin, Calendar, BookOpen, ShieldOff } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/auth/profile/${id}`);
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Profile not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <ShieldOff size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{error}</h1>
        <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-sm">
          The profile you are looking for might be private or doesn't exist.
        </p>
        <Link to="/lms" className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      {/* Cover/Header Space */}
      <div className="h-48 w-full bg-gradient-to-r from-cyan-600 to-blue-700" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-0 -mt-24">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
          {/* Main Profile Info */}
          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-10">
              <div className="relative">
                <div className="w-40 h-40 rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-8 border-white dark:border-slate-900 shadow-2xl">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                      <User size={64} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 w-fit self-center sm:self-auto">
                    {profile.role}
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  {profile.headline || "Passionate Learner @ Acadify"}
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      <Globe size={16} /> Website
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-500">
                    <Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-10">
                {/* Bio Section */}
                <section className="space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">About</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {profile.bio || "This user hasn't added a bio yet."}
                  </p>
                </section>

                {/* Badges/Stats placeholder */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">0</div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Courses Completed</div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">0</div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Learning Hours</div>
                    </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Social Links */}
                <section className="space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">Connect</h2>
                  <div className="flex flex-col gap-3">
                    {profile.socialLinks?.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                        <FaXTwitter className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" size={20} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">X / Twitter</span>
                      </a>
                    )}
                    {profile.socialLinks?.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                        <FaLinkedin className="text-slate-400 group-hover:text-[#0077B5]" size={20} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">LinkedIn</span>
                      </a>
                    )}
                    {profile.socialLinks?.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                        <FaGithub className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" size={20} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">GitHub</span>
                      </a>
                    )}
                    {!profile.socialLinks?.twitter && !profile.socialLinks?.linkedin && !profile.socialLinks?.github && (
                        <p className="text-sm text-slate-400 font-medium italic">No social links added.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
