import React, { useEffect, useState, useRef } from "react";
import "./Login.css";
import showVideo from "../assets/show.mp4";
import ss1 from "../assets/ss1.png";
import ss2 from "../assets/ss2.png";
import ss3 from "../assets/ss3.png";
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

    const text = "FelisAI";
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
            { rootMargin: "500px 0px -10% 0px", threshold: 0 }
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
            { rootMargin: "500px 0px -30% 0px", threshold: 0 }
        );

        cards.forEach((card) => {
            observer2.observe(card);
        });

        //ob3
        const video = document.getElementById("home-video");
        const observer3 = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Play the video when it comes into view
                        video.play();
                    } else {
                        // Pause the video when it goes out of view
                        observer3.unobserve(video);
                    }
                });
            },
            { threshold: 0.8 }
        );
        observer3.observe(video);
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
            <div style={{ height: "200px" }} className="pe-sm-5 ps-sm-5 pe-2 ps-2">
                <p style={{ color: "#bfc3c1" }} className="text-animate mt-2 fs-1">
                    Your personal AI assistant for everything
                </p>
            </div>
            <div className="bgdark pe-sm-5 ps-sm-5 pe-2 ps-2">
                <p ref={targetRef} className={`homepage-text hidden-div ${isVisible ? "fade-in" : ""}`}>
                    Lets take a closer look
                </p>
                <div className="row m-0 mt-4  mb-4">
                    <div className="col-lg-6 col-12  p-2">
                        <p className="blu-col text-center fw-medium fs-4 pb-2">Accurate</p>
                        <div className="infox">
                            <img src={ss1} alt="" class="responsive-image" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-12  p-2 ">
                        <p className="blu-col text-center fw-medium fs-4 pb-2">Fast</p>
                        <div className="infox">
                            <video autoPlay muted playsInline id="home-video" className="responsive-image">
                                <source src={showVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ paddingTop: "100px", backgroundColor: "rgb(23, 23, 23)" }} className=" pe-sm-5 ps-sm-5 pe-2 ps-2 pb-2">
                <p className={`homepage-text`}>FelisAI Cancer</p>
                <p style={{ color: "#bfc3c1" }} className="fw-medium mt-4 fs-4 pb-2">
                    Discover FelisAI Cancer: Your Source for Accurate Cancer Information
                </p>
                <div className=" row m-0 p-0">
                    <div className="col-lg-6 col-12  p-2">
                        <div className="infox">
                            <img src={ss2} alt="" class="responsive-image" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-12  p-2">
                        <div className="infox ">
                            <img src={ss3} alt="" class="responsive-image" />
                        </div>
                    </div>
                </div>
                <div className="mt-4 mb-4 d-flex justify-content-center">
                    <a href="/cancer" style={{ color: "#bfc3c1", textDecoration: "none" }} className="fw-medium fs-4">
                        Try FelisAI Cancer Now
                    </a>
                </div>
            </div>
            <p className="footer text-center ">Copyright © 2024 Project.</p>
        </div>
    );
};

export default Login;
