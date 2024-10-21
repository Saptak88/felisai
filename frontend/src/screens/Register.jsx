import React, { useState, useEffect } from "react";
import "./log.css";
import { Link } from "react-router-dom";
import { useRegisterMutation } from "../slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Register = () => {
    const [email, setEmail] = useState("");
    const [err, setErr] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate("/c");
        }
    }, [userInfo, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await register({ email, password }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate("/c");
        } catch (error) {
            setErr(error?.data?.message);
            console.log(error?.data?.message);
        }
    };
    /*   if (isLoading) {
        return <div>Loading...</div>;
    }*/
    return (
        <div>
            <div className="navbar p-0">
                <div className="navbar-top pe-sm-5 ps-sm-5 pe-2 ps-2">
                    <div className="d-flex align-items-center">
                        <Link to={"/"} className="brand  ">
                            FelisAI
                        </Link>
                    </div>
                </div>
            </div>
            <div className="row mt-4 m-0 p-0 pe-sm-5 ps-sm-5 pe-2 ps-2">
                <div className="col-12 col-lg-6">
                    <div className="login-container">
                        <form onSubmit={handleSubmit} className="login-item">
                            <p className="fs-4 pb-2 pb-sm-3 textcol">Sign up to FelisAI</p>
                            <p className="fw-medium mb-1 mb-sm-2 textcol">Email</p>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@example.com"
                                required
                                className="finput mb-1 mb-sm-3"
                            />
                            <p className="fw-medium mb-1 mb-sm-2 textcol">Password</p>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="example"
                                required
                                className="finput  mb-1 mb-sm-3"
                            />

                            <button type="submit" className="signin-btn">
                                {isLoading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : "Sign up"}
                            </button>
                        </form>
                        <p>{err}</p>
                        <div className="d-flex mt-3">
                            <p className="me-1 textcol">Already have an account? </p>
                            <Link to="/login" className="text-light">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6"></div>
            </div>
        </div>
    );
};

export default Register;
