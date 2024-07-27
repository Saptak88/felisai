import "./App.css";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "./slices/authSlice";
import { useEffect } from "react";

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const expirationTime = localStorage.getItem("expirationTime");
        if (expirationTime) {
            const currentTime = new Date().getTime();

            if (currentTime > expirationTime) {
                dispatch(logout());
            }
        }
    }, [dispatch]);

    return (
        <div className="App">
            <Outlet></Outlet>
        </div>
    );
}

export default App;
