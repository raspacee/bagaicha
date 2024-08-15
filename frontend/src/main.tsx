import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./global.css";
import FeedPage from "./routes/FeedPage";
import UserProfilePage from "./routes/UserProfilePage";
import LoginPage from "./routes/LoginPage";
import SignupPage from "./routes/SignupPage";
import Bookmarks from "./routes/bookmarks";
import AddPlace from "./routes/add_place";
import SearchPage from "./routes/SearchPage";
import EditProfilePage from "./routes/EditProfilePage";
import NotAuthorized from "./routes/not_authorized";
import Suggestions from "./routes/suggestions";
import PlacePage from "./routes/PlacePage";
import { notAuthenticated, isModerator } from "./lib/loaders";
import { store } from "./store";
import { Provider } from "react-redux";
import MainLayout from "./layouts/MainLayout";
import AuthenticatedRoute from "./auth/AuthenticatedRoute";
import { Toaster } from "./components/ui/sonner";
import RequestOwnershipPage from "./routes/RequestOwnershipPage";
import AdminDashboardPage from "./routes/AdminDashboardPage";
import AdminRoute from "./auth/AdminRoute";
import EditPlacePage from "./routes/EditPlacePage";
import FindPlacesPage from "./routes/FindPlacesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthenticatedRoute />,
    children: [
      {
        path: "/",
        element: <Navigate to="/feed" replace />,
      },
      {
        path: "/not-authorized",
        element: <NotAuthorized />,
      },
      {
        path: "feed",
        element: (
          <MainLayout>
            <FeedPage />
          </MainLayout>
        ),
      },
      {
        path: "user/edit-profile",
        element: (
          <MainLayout>
            <EditProfilePage />
          </MainLayout>
        ),
      },
      {
        path: "user/:userId",
        element: (
          <MainLayout>
            <UserProfilePage />
          </MainLayout>
        ),
      },
      {
        path: "place/:placeId",
        element: (
          <MainLayout>
            <PlacePage />
          </MainLayout>
        ),
      },
      {
        path: "place/:placeId/edit",
        element: (
          <MainLayout>
            <EditPlacePage />
          </MainLayout>
        ),
      },
      {
        path: "place/:placeId/request-ownership",
        element: (
          <MainLayout>
            <RequestOwnershipPage />
          </MainLayout>
        ),
      },
      {
        path: "place/add",
        element: (
          <MainLayout>
            <AddPlace />
          </MainLayout>
        ),
      },
      {
        path: "bookmarks",
        element: (
          <MainLayout>
            <Bookmarks />
          </MainLayout>
        ),
      },
      {
        path: "find-places",
        element: (
          <MainLayout>
            <FindPlacesPage />
          </MainLayout>
        ),
      },
      {
        path: "search/",
        element: (
          <MainLayout>
            <SearchPage />
          </MainLayout>
        ),
      },
      {
        path: "suggestions/",
        element: (
          <MainLayout>
            <Suggestions />
          </MainLayout>
        ),
      },
      {
        path: "admin/",
        element: (
          <AdminRoute>
            <MainLayout>
              <AdminDashboardPage />
            </MainLayout>
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    loader: notAuthenticated,
  },
  {
    path: "/signup",
    element: <SignupPage />,
    loader: notAuthenticated,
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster richColors />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
