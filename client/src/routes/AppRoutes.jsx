import { lazy, Suspense } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Layout } from "../components/layout/Layout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { PageTransition } from "../components/ui/PageTransition";
import { ScrollToTop } from "../components/ui/ScrollToTop";
import { useAuth } from "../hooks/useAuth";

// ── Public pages (eager — tiny, needed immediately) ──────────────────────
import { Home } from "../pages/Home";
import { Categories } from "../pages/Categories";
import { Category } from "../pages/Category";
import { Post } from "../pages/Post";
import { Search } from "../pages/Search";
import { Tag } from "../pages/Tag";
import { AllPosts } from "../pages/AllPosts";
import { NotFound } from "../pages/NotFound";

// ── Auth pages ────────────────────────────────────────────────────────────
import { Login } from "../pages/Admin/Login";
import { Register } from "../pages/Admin/Register";
import { ForgotPassword } from "../pages/Admin/ForgotPassword";
import { ResetPassword } from "../pages/Admin/ResetPassword";

// ── Admin pages (lazy — only loaded when admin route is hit) ──────────────
const AdminDashboard    = lazy(() => import("../pages/Admin/Dashboard").then((m) => ({ default: m.AdminDashboard })));
const CreatePost        = lazy(() => import("../pages/Admin/CreatePost").then((m) => ({ default: m.CreatePost })));
const ManagePosts       = lazy(() => import("../pages/Admin/ManagePosts").then((m) => ({ default: m.ManagePosts })));
const ManageCategories  = lazy(() => import("../pages/Admin/ManageCategories").then((m) => ({ default: m.ManageCategories })));

function AdminLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/dev-post/login" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route element={<Layout />}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="/category/:slug" element={<PageTransition><Category /></PageTransition>} />
            <Route path="/post/:slug" element={<PageTransition><Post /></PageTransition>} />
            <Route path="/posts" element={<PageTransition><AllPosts /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/tag/:slug" element={<PageTransition><Tag /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>

          {/* Auth — no layout */}
          <Route path="/dev-post/login" element={<Login />} />
          <Route path="/dev-post/register" element={<Register />} />
          <Route path="/dev-post/forgot-password" element={<ForgotPassword />} />
          <Route path="/dev-post/reset-password" element={<ResetPassword />} />

          {/* Protected admin — lazy loaded */}
          <Route
            path="/dev-post"
            element={<PrivateRoute><AdminLayout /></PrivateRoute>}
          >
            <Route index element={
              <Suspense fallback={<AdminLoader />}>
                <PageTransition><AdminDashboard /></PageTransition>
              </Suspense>
            } />
            <Route path="create" element={
              <Suspense fallback={<AdminLoader />}>
                <PageTransition><CreatePost /></PageTransition>
              </Suspense>
            } />
            <Route path="edit/:id" element={
              <Suspense fallback={<AdminLoader />}>
                <PageTransition><CreatePost /></PageTransition>
              </Suspense>
            } />
            <Route path="posts" element={
              <Suspense fallback={<AdminLoader />}>
                <PageTransition><ManagePosts /></PageTransition>
              </Suspense>
            } />
            <Route path="categories" element={
              <Suspense fallback={<AdminLoader />}>
                <PageTransition><ManageCategories /></PageTransition>
              </Suspense>
            } />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export function AppRoutes() {
  return <AnimatedRoutes />;
}
