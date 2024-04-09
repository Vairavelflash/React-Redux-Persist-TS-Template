import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import "./App.css";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },

    {
      path: "/Home",
      element: (
        <Layout>
          <Home />
        </Layout>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
