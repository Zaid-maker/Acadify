import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../api/axios";
import ProgressBar from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import Comments from "../components/Comments";

const isYouTubeUrl = (url = "") =>
  url.includes("youtube.com") || url.includes("youtu.be");

const getYouTubeEmbedUrl = (url = "") => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`;
    }

    if (parsedUrl.pathname.includes("/embed/")) {
      return url;
    }

    const videoId = parsedUrl.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
};

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return "Outstanding";
  if (rating >= 3.5) return "Strong";
  if (rating >= 2.5) return "Solid";
  if (rating >= 1.5) return "Mixed";

  return "Needs work";
};

const formatReviewDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const allLectures = useMemo(
    () => (course?.sections || []).flatMap((section) => section.lectures || []),
    [course],
  );

  const currentUserReview = useMemo(
    () =>
      reviews.find(
        (review) => String(review.user?._id || review.user) === String(user?._id),
      ) || null,
    [reviews, user?._id],
  );

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
      reviewCount
    : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Number(review.rating) === rating).length,
  }));

  useEffect(() => {
    let ignore = false;

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

    setReviewsLoading(true);

    axios
      .get(`/reviews/${id}`)
      .then((res) => {
        if (ignore) return;

        const nextReviews = [...res.data].sort(
          (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
        );

        setReviews(nextReviews);
        setReviewsError("");
      })
      .catch(() => {
        if (!ignore) setReviewsError("Reviews could not be loaded right now.");
      })
      .finally(() => {
        if (!ignore) setReviewsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    let ignore = false;

    axios
      .get("/enrollments/check", {
        params: { courseId: id },
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

  useEffect(() => {
    if (!course) return undefined;

    let ignore = false;

    axios
      .get(`/progress/${id}`)
      .then((res) => {
        if (ignore) return;

        const completed = res.data.map((progress) =>
          String(progress.lecture),
        );
        const lastCompletedId = completed[completed.length - 1];
        const lastCompletedIndex = allLectures.findIndex(
          (lecture) => lecture._id === lastCompletedId,
        );
        const resumeLecture =
          allLectures[lastCompletedIndex + 1] ||
          allLectures[lastCompletedIndex];

        setCompletedLectures(completed);

        if (resumeLecture) {
          setActiveLecture(resumeLecture);
          setResumeMessage(`Continue with ${resumeLecture.title}`);
        } else {
          setResumeMessage("");
        }
      })
      .catch((err) => console.error(err));

    return () => {
      ignore = true;
    };
  }, [id, course, allLectures]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await axios.post("/enrollments", {
        courseId: id,
      });

      setEnrolled(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const playNextLecture = () => {
    if (!activeLecture) return;

    const currentIndex = allLectures.findIndex(
      (lecture) => lecture._id === activeLecture._id,
    );
    const nextLecture = allLectures[currentIndex + 1];

    if (nextLecture) {
      setActiveLecture(nextLecture);
      setResumeMessage(`Up next: ${nextLecture.title}`);
    } else {
      setResumeMessage("Course complete. Nice work.");
    }
  };

  const markLectureComplete = async (lecture) => {
    if (!lecture) return false;
    if (completedLectures.includes(lecture._id)) return true;

    try {
      setSavingProgress(true);

      await axios.post("/progress", {
        courseId: id,
        lectureId: lecture._id,
      });

      setCompletedLectures((current) =>
        current.includes(lecture._id)
          ? current
          : [...current, lecture._id],
      );
      return true;
    } catch (err) {
      console.error(err.response?.data || err.message);
      return false;
    } finally {
      setSavingProgress(false);
    }
  };

  const handleAutoComplete = async () => {
    if (!activeLecture) return;

    const saved = await markLectureComplete(activeLecture);
    if (saved) playNextLecture();
  };

  const handleReviewChange = (event) => {
    const { name, value } = event.target;

    setReviewForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user || !enrolled || isOwner || currentUserReview) {
      return;
    }

    const trimmedComment = reviewForm.comment.trim();

    if (!trimmedComment) {
      return;
    }

    try {
      setReviewSubmitting(true);

      const res = await axios.post("/reviews", {
        courseId: id,
        rating: reviewForm.rating,
        comment: trimmedComment,
      });

      setReviews((current) =>
        [
          {
            ...res.data,
            user: {
              _id: user._id,
              name: user.name,
            },
          },
          ...current,
        ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
      );
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setReviewSubmitting(false);
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

  const progressPercent = lectureCount
    ? Math.round((completedLectures.length / lectureCount) * 100)
    : 0;
  const isOwner = String(course?.instructor?._id || course?.instructor) === String(user?._id);
  const canWatch = enrolled || isOwner || user?.role === "admin";
  const canReview = Boolean(user && enrolled && !isOwner);
  const isCourseComplete = lectureCount > 0 && completedLectures.length === lectureCount;
  const certificateUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/certificates/${id}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] p-5 text-slate-950 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-105 animate-pulse rounded-lg bg-white" />
            <div className="h-105 animate-pulse rounded-lg bg-white" />
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-950 dark:text-gray-100 transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                Course Workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
                {course.title}
              </h1>
              <div
                className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-400 prose dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html:
                    course.description || "Work through this course one lecture at a time.",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                <p className="text-xl font-bold dark:text-white">{progressPercent}%</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                  Progress
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                <p className="text-xl font-bold dark:text-white">{course.sections?.length || 0}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                  Sections
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                <p className="text-xl font-bold dark:text-white">{lectureCount}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
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
            {canWatch && activeLecture ? (
              isYouTubeUrl(activeLecture.videoUrl) ? (
                <iframe
                  key={activeLecture._id}
                  src={getYouTubeEmbedUrl(activeLecture.videoUrl)}
                  title={activeLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <video
                  key={activeLecture._id}
                  controls
                  onEnded={enrolled ? handleAutoComplete : undefined}
                  className="aspect-video w-full bg-black"
                >
                  <source src={activeLecture.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center px-6 text-center">
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {canWatch ? "Choose a lecture" : "Enrollment required"}
                </div>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                  {canWatch
                    ? "Select any lecture from the curriculum to begin."
                    : "Enroll in this course to unlock the video lessons."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-500">
                  Now Playing
                </p>
                <h2 className="mt-2 text-2xl font-bold dark:text-white">
                  {activeLecture?.title || "Select a lecture"}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                  {enrolled
                    ? `${completedLectures.length} / ${lectureCount} lectures completed`
                    : isOwner
                      ? "You are viewing this course as its instructor."
                    : "Enrollment unlocks lesson playback."}
                </p>
                {activeLecture?.description && (
                  <div
                    className="mt-4 prose dark:prose-invert max-w-none text-slate-600 dark:text-gray-400 text-sm"
                    dangerouslySetInnerHTML={{ __html: activeLecture.description }}
                  />
                )}
                {enrolled && resumeMessage && (
                  <p className="mt-2 text-sm font-semibold text-cyan-700 dark:text-cyan-500">
                    {resumeMessage}
                  </p>
                )}
                {enrolled && lectureCount > 0 && (
                  <div className="mt-4 max-w-md">
                    <ProgressBar value={progressPercent} />
                  </div>
                )}
                {enrolled && isCourseComplete && (
                  <p className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-500">
                    Course completed.
                  </p>
                )}
                {enrolled && isCourseComplete && (
                  <button
                    type="button"
                    onClick={() => window.open(certificateUrl, "_blank", "noopener,noreferrer")}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 dark:hover:bg-emerald-400"
                  >
                    Download Certificate
                  </button>
                )}
              </div>

              {isOwner ? (
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <span className="inline-flex rounded-md bg-cyan-50 dark:bg-cyan-900/30 px-4 py-2 text-sm font-bold text-cyan-700 dark:text-cyan-400">
                    Instructor View
                  </span>
                  <Link
                    to={`/instructor/course/${course._id}`}
                    className="inline-flex items-center justify-center rounded-md bg-slate-950 dark:bg-gray-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-gray-700"
                  >
                    Edit Course
                  </Link>
                </div>
              ) : !enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              ) : (
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <span className="inline-flex rounded-md bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                    Enrolled
                  </span>
                  {savingProgress && (
                    <span className="text-sm font-semibold text-slate-500">
                      Saving progress...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors lg:sticky lg:top-5 lg:self-start">
          <div className="border-b border-slate-200 dark:border-gray-800 p-5">
            <h2 className="text-xl font-bold dark:text-white">Course Content</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              {lectureCount} lectures across {course.sections?.length || 0} sections
            </p>
            <div className="mt-4">
              <ProgressBar
                value={progressPercent}
                label={`${completedLectures.length} / ${lectureCount} completed`}
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-3">
            {course.sections?.length ? (
              course.sections.map((section, sectionIndex) => (
                <section key={section._id} className="mb-3 last:mb-0">
                  <div className="px-2 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500">
                      Section {sectionIndex + 1}
                    </p>
                    <h3 className="mt-1 font-bold text-slate-800 dark:text-gray-100">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {section.lectures?.length ? (
                      section.lectures.map((lecture, lectureIndex) => {
                        const isActive = activeLecture?._id === lecture._id;
                        const isCompleted = completedLectures.includes(
                          lecture._id,
                        );

                        return (
                          <button
                            key={lecture._id}
                            type="button"
                            onClick={() => {
                              if (canWatch) setActiveLecture(lecture);
                            }}
                            disabled={!canWatch}
                            className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                              isActive
                                ? "bg-cyan-50 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-100 ring-1 ring-cyan-200 dark:ring-cyan-800"
                                : isCompleted
                                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
                                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800"
                            } ${
                              !canWatch
                                ? "cursor-not-allowed opacity-55"
                                : "cursor-pointer"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isActive
                                  ? "bg-cyan-700 dark:bg-cyan-600 text-white"
                                  : isCompleted
                                    ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                                  : "bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400"
                              }`}
                            >
                              {isCompleted ? "OK" : lectureIndex + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold">
                                {lecture.title}
                              </span>
                              <span className="mt-1 block text-xs text-slate-400 dark:text-gray-500">
                                {isYouTubeUrl(lecture.videoUrl)
                                  ? "YouTube"
                                  : "MP4"}{" "}
                                ·{" "}
                                {isCompleted
                                  ? "Completed"
                                  : canWatch
                                    ? "Ready to watch"
                                    : "Locked"}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="rounded-md bg-slate-50 dark:bg-gray-800/50 px-3 py-3 text-sm text-slate-500 dark:text-gray-400">
                        No lectures in this section yet.
                      </p>
                    )}
                  </div>
                </section>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 dark:bg-gray-800/50 p-4 text-sm text-slate-500 dark:text-gray-400">
                This course does not have published sections yet.
              </p>
            )}
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors">
          <div className="border-b border-slate-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-500">
                  Reviews
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Learner feedback for this course.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-gray-400">
                  Read recent reviews, or leave feedback after enrolling in the course.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-105">
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                  <p className="text-2xl font-bold text-slate-950 dark:text-white">
                    {reviewCount ? averageRating.toFixed(1) : "--"}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                    Average
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                  <p className="text-2xl font-bold text-slate-950 dark:text-white">{reviewCount}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                    Reviews
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                  <p className="text-2xl font-bold text-slate-950 dark:text-white">
                    {reviews.filter((review) => Number(review.rating) >= 4).length}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                    4+ Stars
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 px-4 py-3">
                  <p className="text-2xl font-bold text-slate-950 dark:text-white">
                    {reviewsLoading ? "..." : ratingBreakdown[0]?.count || 0}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400">
                    Top Ratings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b border-slate-200 dark:border-gray-800 p-5 lg:border-b-0 lg:border-r lg:p-6">
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800/50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-500">
                      Leave a review
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                      {currentUserReview ? "Your review" : "Share your experience"}
                    </h3>
                  </div>
                  <div className="rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-sm font-bold text-slate-700 dark:text-gray-200 shadow-sm">
                    {getRatingLabel(reviewForm.rating)}
                  </div>
                </div>

                {!user ? (
                  <div className="mt-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm leading-6 text-slate-600 dark:text-gray-400">
                    Sign in to leave feedback for this course.
                  </div>
                ) : !canReview ? (
                  <div className="mt-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm leading-6 text-slate-600 dark:text-gray-400">
                    Enroll in the course to unlock the review form.
                  </div>
                ) : currentUserReview ? (
                  <div className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-500">
                      Submitted
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {currentUserReview.rating}/5 - {getRatingLabel(currentUserReview.rating)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/70">
                      {currentUserReview.comment || "No comment was added."}
                    </p>
                    <p className="mt-3 text-xs font-medium text-emerald-800/80 dark:text-emerald-100/40">
                      Reviews are limited to one submission per learner right now.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                    <fieldset>
                      <legend className="text-sm font-semibold text-slate-700 dark:text-gray-400">
                        Rating
                      </legend>
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const selected = reviewForm.rating === rating;

                          return (
                            <button
                              key={rating}
                              type="button"
                              onClick={() =>
                                setReviewForm((current) => ({
                                  ...current,
                                  rating,
                                }))
                              }
                              className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                                selected
                                  ? "border-cyan-600 bg-cyan-600 text-white shadow-sm"
                                  : "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-500"
                              }`}
                            >
                              {rating}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700 dark:text-gray-400">
                        Comment
                      </span>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        rows={5}
                        placeholder="What stood out, and what could be improved?"
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={reviewSubmitting || !reviewForm.comment.trim()}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {reviewSubmitting ? "Publishing..." : "Publish review"}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Rating breakdown
                  </h3>
                  <span className="text-sm font-semibold text-slate-500 dark:text-gray-500">
                    {reviewCount} total
                  </span>
                </div>

                {ratingBreakdown.map((item) => {
                  const percent = reviewCount ? (item.count / reviewCount) * 100 : 0;

                  return (
                    <div key={item.rating} className="flex items-center gap-3 text-sm">
                      <span className="w-10 shrink-0 font-semibold text-slate-700 dark:text-gray-400">
                        {item.rating}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-cyan-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-semibold text-slate-500 dark:text-gray-500">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Recent reviews</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {reviewsLoading
                      ? "Loading reviews..."
                      : reviewCount
                        ? "Most recent feedback appears first."
                        : "No one has reviewed this course yet."}
                  </p>
                </div>
                {reviewsError && (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    {reviewsError}
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                      />
                    ))}
                  </div>
                ) : reviewCount > 0 ? (
                  reviews.map((review) => (
                    <article
                      key={review._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-950">
                            {review.user?.name || "Learner"}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {formatReviewDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-cyan-700 shadow-sm">
                          <span>{review.rating}/5</span>
                          <span className="text-slate-300">|</span>
                          <span>{getRatingLabel(review.rating)}</span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {review.comment || "No written comment was added."}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-500">
                    This course has no reviews yet. Once learners start sharing feedback, it will show up here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Comments courseId={id} enrolled={enrolled} course={course} />
    </main>
  );
}

export default CourseDetail;
