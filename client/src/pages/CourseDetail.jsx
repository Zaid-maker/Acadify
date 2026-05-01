import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../api/axios";

function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const userId = "123";

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    axios
      .get(`/courses/full/${id}`)
      .then((res) => {
        if (ignore) return;

        const nextCourse = res.data;
        const firstLecture = nextCourse.sections?.find(
          (section) => section.lectures?.length,
        )?.lectures[0];

        setCourse(nextCourse);
        setActiveLecture(firstLecture || null);
        setError("");
      })
      .catch(() => {
        if (!ignore) setError("This course could not be loaded right now.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    let ignore = false;

    axios
      .get("/enrollments/check", {
        params: { userId, courseId: id },
      })
      .then((res) => {
        if (!ignore) setEnrolled(res.data.enrolled);
      })
      .catch(() => {
        if (!ignore) setEnrolled(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await axios.post("/enrollments", {
        userId,
        courseId: id,
      });

      setEnrolled(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const lectureCount = useMemo(
    () =>
      (course?.sections || []).reduce(
        (total, section) => total + (section.lectures?.length || 0),
        0,
      ),
    [course],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] p-5 text-slate-950 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[420px] animate-pulse rounded-lg bg-white" />
            <div className="h-[420px] animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] p-5 text-slate-950 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p>{error || "Course not found."}</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Back to courses
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Course Workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {course.description || "Work through this course one lecture at a time."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xl font-bold">{course.sections?.length || 0}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Sections
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xl font-bold">{lectureCount}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Lectures
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
            {enrolled && activeLecture ? (
              <video
                key={activeLecture._id}
                controls
                className="aspect-video w-full bg-black"
              >
                <source src={activeLecture.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center px-6 text-center">
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {enrolled ? "Choose a lecture" : "Enrollment required"}
                </div>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                  {enrolled
                    ? "Select any lecture from the curriculum to begin."
                    : "Enroll in this course to unlock the video lessons."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Now Playing
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {activeLecture?.title || "Select a lecture"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {enrolled
                    ? "Use the curriculum panel to switch lessons."
                    : "Enrollment unlocks lesson playback."}
                </p>
              </div>

              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              ) : (
                <span className="inline-flex shrink-0 rounded-md bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  Enrolled
                </span>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-5 lg:self-start">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">Course Content</h2>
            <p className="mt-1 text-sm text-slate-500">
              {lectureCount} lectures across {course.sections?.length || 0} sections
            </p>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-3">
            {course.sections?.length ? (
              course.sections.map((section, sectionIndex) => (
                <section key={section._id} className="mb-3 last:mb-0">
                  <div className="px-2 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Section {sectionIndex + 1}
                    </p>
                    <h3 className="mt-1 font-bold text-slate-800">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {section.lectures?.length ? (
                      section.lectures.map((lecture, lectureIndex) => {
                        const isActive = activeLecture?._id === lecture._id;

                        return (
                          <button
                            key={lecture._id}
                            type="button"
                            onClick={() => {
                              if (enrolled) setActiveLecture(lecture);
                            }}
                            disabled={!enrolled}
                            className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                              isActive
                                ? "bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200"
                                : "text-slate-600 hover:bg-slate-50"
                            } ${
                              !enrolled
                                ? "cursor-not-allowed opacity-55"
                                : "cursor-pointer"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isActive
                                  ? "bg-cyan-700 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {lectureIndex + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold">
                                {lecture.title}
                              </span>
                              <span className="mt-1 block text-xs text-slate-400">
                                {enrolled ? "Ready to watch" : "Locked"}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
                        No lectures in this section yet.
                      </p>
                    )}
                  </div>
                </section>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                This course does not have published sections yet.
              </p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CourseDetail;
