import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Assignments = lazy(() => import("@/components/pages/Assignments"));
const AssignmentDetail = lazy(() => import("@/components/pages/AssignmentDetail"));
const AssignmentFormPage = lazy(() => import("@/components/pages/AssignmentForm"));
const SubmissionFormPage = lazy(() => import("@/components/pages/SubmissionForm"));
const GradingPage = lazy(() => import("@/components/pages/GradingPage"));
const Students = lazy(() => import("@/components/pages/Students"));
const Grades = lazy(() => import("@/components/pages/Grades"));
const Analytics = lazy(() => import("@/components/pages/Analytics"));
const Resources = lazy(() => import("@/components/pages/Resources"));
const Calendar = lazy(() => import("@/components/pages/Calendar"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: "assignments",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Assignments />
      </Suspense>
    )
  },
  {
    path: "assignments/new",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AssignmentFormPage />
      </Suspense>
    )
  },
  {
    path: "assignments/:id",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AssignmentDetail />
      </Suspense>
    )
  },
  {
    path: "assignments/:id/edit",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AssignmentFormPage />
      </Suspense>
    )
  },
{
    path: "assignments/:id/submit",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SubmissionFormPage />
      </Suspense>
    )
  },
  {
    path: "assignments/:id/submissions/:submissionId/edit",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SubmissionFormPage />
      </Suspense>
    )
  },
  {
    path: "submissions/:submissionId/grade",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <GradingPage />
      </Suspense>
    )
  },
  {
    path: "students",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Students />
      </Suspense>
    )
  },
{
    path: "grades",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Grades />
      </Suspense>
    )
  },
  {
    path: "grades/:studentId",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Grades />
      </Suspense>
    )
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Analytics />
      </Suspense>
    )
  },
  {
    path: "resources",
element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Resources />
      </Suspense>
    )
  },
  {
    path: "calendar",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Calendar />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);