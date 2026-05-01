import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    axios
      .get("/courses")
      .then((res) => {
        if (!ignore) {
          setCourses(res.data);
          setError("");
        }
      })
      .catch(() => {
        if (!ignore) setError("Courses could not be loaded right now.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totalLessons = useMemo(
    () =>
      courses.reduce(
        (total, course) =>
          total +
          (course.sections || []).reduce(
            (sectionTotal, section) =>
              sectionTotal + (section.lectures?.length || 0),
            0,
          ),
        0,
      ),
    [courses],
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Acadify
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Learn from structured courses built for steady progress.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse available courses, open a course workspace, enroll, and
              continue through lectures from one focused learning view.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-bold text-slate-950">
                {courses.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Courses</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-bold text-slate-950">
                {totalLessons}
              </p>
              <p className="mt-1 text-sm text-slate-500">Lessons</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Course Catalog
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a course to view its curriculum and start learning.
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-950">
              No courses yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              New courses will appear here when they are published.
            </p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course, index) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="group flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Course {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-400 transition group-hover:text-cyan-700">
                    Open
                  </span>
                </div>

                <h3 className="text-xl font-bold leading-snug text-slate-950">
                  {course.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                  {course.description || "Course details will be added soon."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span>{course.sections?.length || 0} sections</span>
                  <span className="font-semibold text-slate-700">
                    View curriculum
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
