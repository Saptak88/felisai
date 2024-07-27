import React, { useEffect, useState, useRef } from "react";
import "./Login.css";
import showVideo from "../assets/show.mp4";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Login = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    useEffect(() => {
        if (userInfo) {
            navigate("/c");
        }
    }, [userInfo, navigate]);

    const text = "Project";
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);
    const speed = 200;
    //intersec obs
    const [isVisible, setIsVisible] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer1 = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { rootMargin: "300px 0px -5% 0px", threshold: 0 }
        );

        if (targetRef.current) {
            observer1.observe(targetRef.current);
        }

        //
        const cards = document.querySelectorAll(".blu-col");
        // console.log(cards);

        const observer2 = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("fade-in", entry.isIntersecting);
                });
            },
            { rootMargin: "300px 0px -30% 0px", threshold: 0 }
        );

        cards.forEach((card) => {
            observer2.observe(card);
        });
    }, []);

    //
    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex(index + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed]);

    const [showElement, setShowElement] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowElement(true);
        }, 800); // 1000 milliseconds = 1 second

        // Cleanup timer if the component unmounts
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="login-screen ">
            <div className="d-flex flex-wrap pe-sm-5 ps-sm-5 pe-2 ps-2">
                <p className="homepage-text text-animate ">Welcome to&nbsp;</p>
                <p className="homepage-text text-animate gradient">{displayedText}</p>
                {showElement && <p className="cursor text-animate">|</p>}
            </div>
            <div style={{ height: "200px" }}></div>
            <div className="bgdark pe-sm-5 ps-sm-5 pe-2 ps-2 mb-4">
                <p ref={targetRef} className={`homepage-text hidden-div ${isVisible ? "fade-in" : ""}`}>
                    Lets take a closer look
                </p>
                <div className="row m-0 mt-4  mb-4">
                    <div className="col-lg-6 col-12  p-2 ">
                        <p className="blu-col text-center fw-medium fs-4 pb-2">Superfast</p>
                        <div className="infox">
                            <div className="vdo-cont">
                                <video autoPlay muted playsInline>
                                    <source src={showVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-12  p-2">
                        <p className="blu-col text-center fw-medium fs-4 pb-2">Accurate</p>
                        <div className="infox">kalo</div>
                    </div>
                </div>
            </div>
            <div style={{ height: "400px" }}>kalo</div>
            <p className="footer text-center mt-2">Copyright © 2024 Project.</p>
        </div>
    );
};

export default Login;
