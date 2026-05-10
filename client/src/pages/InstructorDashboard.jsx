import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const initialCourseForm = {
  title: "",
  description: "",
  price: "",
};

function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [error, setError] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const handleCourseChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleDescriptionChange = (content) => {
    setCourseForm((prev) => ({ ...prev, description: content }));
    setError("");
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      setCreatingCourse(true);
      setError("");

      const res = await axios.post("/courses", {
        ...courseForm,
        price: Number(courseForm.price || 0),
      });

      navigate(`/instructor/course/${res.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Course could not be created. Please try again.",
      );
      console.error(err.response?.data || err.message);
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb] dark:bg-gray-950 text-slate-950 dark:text-white">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                Instructor Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                Start a new course.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-400">
                Create the course shell first. After it is saved, you will move
                into the builder to add sections and lectures.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,520px)_1fr]">
        <form
          onSubmit={handleCreateCourse}
          className="rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-500">
            Step 1
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Create Course</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Add the public course details learners will see.
          </p>

          {error && (
            <div className="mt-5 rounded-md border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Course title
            </span>
            <input
              name="title"
              value={courseForm.title}
              placeholder="React Foundations"
              onChange={handleCourseChange}
              required
              className="mt-2 w-full rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Description
            </span>
            <div className="mt-2 flex flex-col">
              <ReactQuill
                theme="snow"
                value={courseForm.description}
                onChange={handleDescriptionChange}
                placeholder="What students will learn"
                className="h-48 overflow-hidden rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">Price</span>
            <input
              name="price"
              type="number"
              min="0"
              value={courseForm.price}
              placeholder="0"
              onChange={handleCourseChange}
              className="mt-2 w-full rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20"
            />
          </label>

          <button
            type="submit"
            disabled={creatingCourse}
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-cyan-700 dark:bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 dark:hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-70"
          >
            {creatingCourse ? "Creating..." : "Create Course"}
          </button>
        </form>

        <aside className="rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500">
            Authoring Flow
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">What happens next</h2>
          <div className="mt-5 space-y-3">
            {["Create the course", "Add sections", "Add lectures", "Review live structure"].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-3 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-700 dark:bg-cyan-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                    {step}
                  </span>
                </div>
              ),
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default InstructorDashboard;
