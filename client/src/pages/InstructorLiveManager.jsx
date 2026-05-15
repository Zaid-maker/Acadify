import { useEffect, useState } from "react";
import { Video, Users, Clock, AlertCircle, ExternalLink, StopCircle, Play, User, Mail, ChevronDown, ChevronUp } from "lucide-react";
import axios from "../api/axios";

function InstructorLiveManager() {
  const [courses, setCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedParticipants, setExpandedParticipants] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch instructor's courses
      const coursesRes = await axios.get("/courses/instructor/me");
      const instructorCourses = coursesRes.data;
      setCourses(instructorCourses);

      // Fetch active live sessions
      const sessionsMap = {};
      for (const course of instructorCourses) {
        try {
          const sessionRes = await axios.get(`/live-sessions/course/${course._id}`);
          if (sessionRes.data) {
            sessionsMap[course._id] = sessionRes.data;
          }
        } catch (err) {
          console.error(`Error fetching session for ${course._id}:`, err);
        }
      }
      setLiveSessions(sessionsMap);
    } catch (err) {
      setError("Failed to load your courses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipants = (courseId) => {
    setExpandedParticipants(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleGoLive = async (course) => {
    try {
      setActionLoading(course._id);
      const roomName = `acadify-${course._id}-${Date.now()}`;
      const res = await axios.post("/live-sessions/start", {
        courseId: course._id,
        title: `Live Session: ${course.title}`,
        roomName,
      });
      setLiveSessions((prev) => ({ ...prev, [course._id]: res.data }));
      window.open(`https://meet.jit.si/${roomName}`, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Could not start live session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndLive = async (courseId) => {
    const session = liveSessions[courseId];
    if (!session) return;

    try {
      setActionLoading(courseId);
      await axios.put(`/live-sessions/end/${session._id}`);
      setLiveSessions((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    } catch (err) {
      alert("Could not end live session");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your virtual classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 transition-colors">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
              <Video className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Live Session Manager
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Launch instant video classes and interact with your students in real-time.
          </p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isLive = !!liveSessions[course._id];
            const isLoading = actionLoading === course._id;

            return (
              <div 
                key={course._id} 
                className={`relative group bg-white dark:bg-gray-800 border ${isLive ? 'border-cyan-500 dark:border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-gray-200 dark:border-gray-700'} rounded-3xl p-6 transition-all duration-300 hover:shadow-xl`}
              >
                {isLive && (
                  <div className="absolute -top-3 -right-3">
                    <span className="relative flex h-8 w-8">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex h-8 w-8 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-black text-white">LIVE</span>
                    </span>
                  </div>
                )}

                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                      {course.category || "Course"}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-[3.5rem]">
                      {course.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{course.enrollmentsCount || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{course.sections?.length || 0} Sections</span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    {isLive ? (
                      <>
                        {/* Participant List Section */}
                        <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                          <button 
                            onClick={() => toggleParticipants(course._id)}
                            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-600" />
                              <span>Joined Participants ({liveSessions[course._id].participants?.length || 0})</span>
                            </div>
                            {expandedParticipants[course._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {expandedParticipants[course._id] && (
                            <div className="p-2 pt-0 max-h-48 overflow-y-auto border-t border-gray-100 dark:border-gray-700/50">
                              {liveSessions[course._id].participants?.length > 0 ? (
                                <div className="space-y-1">
                                  {liveSessions[course._id].participants.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                      {p.user.avatar ? (
                                        <img src={p.user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                                      ) : (
                                        <div className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center">
                                          <User className="w-3.5 h-3.5 text-cyan-600" />
                                        </div>
                                      )}
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{p.user.name}</span>
                                        <span className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                          <Mail className="w-2.5 h-2.5" />
                                          {p.user.email}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-4 text-center">
                                  <p className="text-xs text-gray-500 italic">No students joined yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => window.open(`https://meet.jit.si/${liveSessions[course._id].roomName}#config.prejoinPageEnabled=true&config.lobby.enabled=true`, "_blank")}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cyan-600/20"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Join Meeting
                        </button>
                        <button
                          onClick={() => handleEndLive(course._id)}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-2 w-full border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold py-3.5 rounded-2xl transition-all"
                        >
                          <StopCircle className="w-5 h-5" />
                          {isLoading ? "Ending..." : "End Session"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleGoLive(course)}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] group/btn"
                      >
                        <Play className="w-5 h-5 fill-current transition-transform group-hover/btn:scale-110" />
                        {isLoading ? "Launching..." : "Start Class Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
              <Video className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-gray-500 dark:text-gray-400">Create your first course to start hosting live sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorLiveManager;
