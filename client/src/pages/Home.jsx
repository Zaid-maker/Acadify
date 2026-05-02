import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalCourses, setTotalCourses] = useState(0);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sort: "newest",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    axios
      .get("/courses", {
        params: {
          page,
          limit: 8,
          search,
          ...filters,
        },
      })
      .then((res) => {
        if (!ignore) {
          setCourses(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalCourses(res.data.total || 0);
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
  }, [page, search, filters]);

  const totalLessons = useMemo(
    () =>
      courses.reduce(
        (total, course) => total + (course.lectureCount || 0),
        0,
      ),
    [courses],
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
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
                {totalCourses}
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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Course Catalog
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a course to view its curriculum and start learning.
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              {(user.role === "instructor" || user.role === "admin") && (
                <Link
                  to="/instructor"
                  className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100"
                >
                  Dashboard
                </Link>
              )}
              <span className="max-w-40 truncate text-sm font-semibold text-slate-700">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Search courses</span>
              <input
                type="search"
                placeholder="Search courses by title, description, or category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sort by</span>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((current) => ({ ...current, sort: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating_desc">Top Rated</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Min price</span>
              <input
                placeholder="0"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => {
                  setFilters((current) => ({ ...current, minPrice: e.target.value }));
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Max price</span>
              <input
                placeholder="100000"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters((current) => ({ ...current, maxPrice: e.target.value }));
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Minimum rating</span>
              <select
                value={filters.minRating}
                onChange={(e) => {
                  setFilters((current) => ({ ...current, minRating: e.target.value }));
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">All ratings</option>
                <option value="4">4 stars & above</option>
                <option value="3">3 stars & above</option>
                <option value="2">2 stars & above</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  setFilters({
                    minPrice: "",
                    maxPrice: "",
                    minRating: "",
                    sort: "newest",
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                Clear filters
              </button>
            </div>
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
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      Course {(page - 1) * 8 + index + 1}
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

                  <p className="mt-4 text-sm font-semibold text-amber-600">
                    ⭐ {Number(course.avgRating || 0).toFixed(1)} ({course.reviewCount || 0})
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>{course.sectionCount || 0} sections</span>
                    <span className="font-semibold text-slate-700">
                      View curriculum
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
              <div className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                <span className="font-semibold text-slate-900">{totalPages}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                      number === page
                        ? "border-cyan-600 bg-cyan-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Home;
