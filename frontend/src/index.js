import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import Header from "./components/Header";
import HomePage from "./screens/HomePage";
import Login from "./screens/Login";
import Register from "./screens/Register";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App></App>}>
            <Route
                index={true}
                path="/"
                element={
                    <>
                        <Header></Header>
                        <HomePage></HomePage>
                    </>
                }
            ></Route>
            <Route
                path="/c/:sessionId"
                element={
                    <>
                        <Header></Header>
                        <Dashboard></Dashboard>
                    </>
                }
            ></Route>
            <Route
                path="/c"
                element={
                    <>
                        <Header></Header>
                        <Dashboard></Dashboard>
                    </>
                }
            ></Route>
            <Route
                path="/cancer"
                element={
                    <>
                        <Header></Header>
                        <Dashboard></Dashboard>
                    </>
                }
            ></Route>
            <Route
                path="/cancer/:sessionId"
                element={
                    <>
                        <Header></Header>
                        <Dashboard></Dashboard>
                    </>
                }
            ></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
        </Route>
    )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
);
