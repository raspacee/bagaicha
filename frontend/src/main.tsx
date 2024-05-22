import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import Feed from "./routes/feed";
import UserProfile from "./routes/user_profile";
import Login from "./routes/login";
import Signup from "./routes/signup";
import ReviewCreate from "./routes/review_create";
import Bookmarks from "./routes/bookmarks";
import Place from "./routes/place";
import FindPlaces from "./routes/find_places";
import EditPlace from "./routes/edit_place";
import AddPlace from "./routes/add_place";
import Notification from "./routes/notifications";
import NotAuthorized from "./routes/not_authorized";
import { getUserData, notAuthenticated, isModerator } from "./lib/loaders";
import { store } from "./store";
import { Provider } from "react-redux";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: getUserData,
    children: [
      {
        path: "/not-authorized",
        element: <NotAuthorized />,
      },
      {
        path: "feed",
        element: <Feed />,
      },
      {
        path: "feed/create",
        element: <ReviewCreate />,
      },
      {
        path: "user/edit-profile",
        element: <h1>Edit</h1>,
      },
      {
        path: "user/:slug",
        element: <UserProfile />,
      },
      {
        path: "place/:place_id",
        element: <Place />,
      },
      {
        path: "place/add",
        element: <AddPlace />,
      },
      {
        path: "bookmarks",
        element: <Bookmarks />,
      },
      {
        path: "find-places",
        element: <FindPlaces />,
      },
      {
        path: "edit-place/:place_id",
        loader: isModerator,
        element: <EditPlace />,
      },
      {
        path: "notification/",
        element: <Notification />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    loader: notAuthenticated,
  },
  {
    path: "/signup",
    element: <Signup />,
    loader: notAuthenticated,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
