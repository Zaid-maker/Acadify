import { useEffect, useState } from "react";
import axios from "../api/axios";
import { User, Mail, Book, Calendar, Search, Users } from "lucide-react";

function InstructorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("/enrollments/instructor/students")
      .then(res => {
        setStudents(res.data);
        setError("");
      })
      .catch(err => {
        console.error(err);
        setError("Could not load students. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            My Students
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage and view all learners enrolled in your courses.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-6 rounded-2xl text-rose-600 dark:text-rose-400 font-bold">
          {error}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No students found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchTerm ? "Try a different search term." : "Once students enroll in your courses, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map(student => (
            <div 
              key={student._id}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all p-6 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{student.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Book className="w-3.5 h-3.5" />
                  Enrolled Courses ({student.enrolledCourses.length})
                </p>
                <div className="flex flex-col gap-2">
                  {student.enrolledCourses.map(course => (
                    <div 
                      key={course._id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100/50 dark:border-gray-600/30"
                    >
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold">
                          Joined {new Date(course.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorStudents;
