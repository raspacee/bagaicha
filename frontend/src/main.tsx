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
import ReviewCreate from "./routes/review_create";
import Bookmarks from "./routes/bookmarks";
//import Place from "./routes/place_archived";
import FindPlaces from "./routes/find_places";
import EditPlace from "./routes/edit_place";
import AddPlace from "./routes/add_place";
import Search from "./routes/search";
import EditProfilePage from "./routes/EditProfilePage";
import NotAuthorized from "./routes/not_authorized";
import Suggestions from "./routes/suggestions";
import Place from "./routes/place";
import { notAuthenticated, isModerator } from "./lib/loaders";
import { store } from "./store";
import { Provider } from "react-redux";
import MainLayout from "./layouts/MainLayout";
import AuthenticatedRoute from "./auth/AuthenticatedRoute";
import { Toaster } from "./components/ui/sonner";

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
        path: "feed/create",
        element: <ReviewCreate />,
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
        path: "place/:place_id",
        element: <Place />,
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
            <FindPlaces />
          </MainLayout>
        ),
      },
      {
        path: "edit-place/:place_id",
        loader: isModerator,
        element: <EditPlace />,
      },
      {
        path: "search/",
        element: (
          <MainLayout>
            <Search />
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
