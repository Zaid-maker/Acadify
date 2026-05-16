import { useState } from "react";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Globe, Camera, Check, Shield, ShieldOff, Copy, ExternalLink, Phone } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const profileUrl = `${window.location.origin}/profile/${user?._id}`;

  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    website: user?.website || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    isPublic: user?.isPublic ?? true,
    socialLinks: {
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
      github: user?.socialLinks?.github || "",
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied!");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("social.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value },
      }));
    } else {
      setForm((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch("/auth/profile", form);
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 transition-colors">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Manage your public information and how other students see you.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar & Header */}
          <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl shadow-slate-200 dark:shadow-none">
                  {form.avatar ? (
                    <img src={form.avatar} alt={form.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-cyan-500 transition-colors">
                  <Camera size={18} />
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Headline</label>
                    <input
                      name="headline"
                      value={form.headline}
                      onChange={handleChange}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Phone Number (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="off"
                        placeholder="+1 234 567 890"
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-12 pr-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Avatar URL</label>
                  <input
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Visibility & Settings */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${form.isPublic ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {form.isPublic ? <Shield size={24} /> : <ShieldOff size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">Profile Visibility</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      {form.isPublic 
                        ? "Currently public. Other students can view your profile and social links." 
                        : "Currently private. Your profile is only visible to you and instructors."}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="isPublic"
                    checked={form.isPublic}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-active:scale-95 transition-transform"></div>
                </label>
              </div>

              {form.isPublic && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-3">Your Public Profile Link</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-2xl border border-slate-100 dark:border-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                      {profileUrl}
                    </div>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all active:scale-95"
                      title="Copy Link"
                    >
                      <Copy size={20} />
                    </button>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-cyan-600 hover:border-cyan-500 transition-all active:scale-95"
                      title="View Profile"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              )}
            </section>

            {/* Bio & Links */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold dark:text-white">About Me</h2>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Bio</label>
                <textarea
                  name="bio"
                  rows={5}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell students about yourself..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-cyan-500 dark:text-white resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Personal Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                    <Globe size={16} />
                  </div>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourpage.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-12 pr-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold dark:text-white">Social Presence</h2>
                <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Twitter Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                      <FaXTwitter size={16} />
                    </div>
                    <input
                      name="social.twitter"
                      value={form.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="Twitter URL"
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-12 pr-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">LinkedIn Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                      <FaLinkedin size={16} />
                    </div>
                    <input
                      name="social.linkedin"
                      value={form.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="LinkedIn URL"
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-12 pr-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">GitHub Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                      <FaGithub size={16} />
                    </div>
                    <input
                      name="social.github"
                      value={form.socialLinks.github}
                      onChange={handleChange}
                      placeholder="GitHub URL"
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-12 pr-5 py-3 text-sm outline-none transition focus:border-cyan-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-10 py-4 text-sm font-black text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <Check size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
