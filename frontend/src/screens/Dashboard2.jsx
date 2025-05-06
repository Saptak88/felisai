import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import Chatinput from "../components/Chatinput";
import Message from "../components/Message";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../slices/uiSlice";
import { useNavigate, useParams } from "react-router-dom";

const Dashboard2 = () => {
    const { userInfo } = useSelector((state) => state.auth); //userinfo from storage
    const { sessionId: sessionIdParam } = useParams(); // Get the sesionId from the URL parameters
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const messageContainerRef = useRef(null);
    const userScrollingRef = useRef(false);
    const previousScrollTopRef = useRef(0);
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch("/api/v1/chat/sessions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type: 0 }),
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setSessions(data);
            } catch (error) {
                console.log(error);
            }
        };
        if (userInfo) fetchSessions();
    }, [userInfo]);

    /*
    useEffect(() => {
        if (!userInfo) {
            navigate("/login");
        }
    }, [userInfo, navigate]);*/
    //
    useEffect(() => {
        const updateSession = async () => {
            if (sessionId && (messages.length - 2) % 4 === 0) {
                try {
                    const response = await fetch("/api/v1/chat/updateSession", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ messages: messages, sessionId }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to update session");
                    }

                    const updatedSession = await response.json();

                    setSessions((prevSessions) =>
                        prevSessions.map((session) => (session._id === updatedSession._id ? updatedSession : session))
                    );
                } catch (error) {
                    console.error("Error updating session:", error);
                }
            }
        };

        updateSession();
    }, [messages.length, sessionId]);
    //create session
    const handleNewSession = async () => {
        try {
            const response = await fetch("/api/v1/chat/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: 0 }),
            });
            const data = await response.json();
            const newSessionId = data._id;
            setSessionId(newSessionId);
            setSessions((prevSessions) => [data, ...prevSessions]);
            navigate(`/cancer/${newSessionId}`, { replace: true });
            return newSessionId; // Use navigate to redirect
        } catch (error) {
            console.error("Error creating new session:", error);
        }
    };
    useEffect(() => {
        if (sessionIdParam) {
            // Fetch chat history for the existing session
            setSessionId(sessionIdParam);
            const fetchChatHistory = async () => {
                try {
                    const response = await fetch("/api/v1/chat/history", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ sessionId: sessionIdParam }),
                    });
                    const data = await response.json();
                    setMessages(data);
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                }
            };

            fetchChatHistory();
        }
    }, []); //

    const handleSendMessage = async (message) => {
        if (!sessionId && userInfo) {
            try {
                const newSessionId = await handleNewSession();
                setSessionId(newSessionId);
                sendMessage(message, newSessionId);
            } catch (error) {
                console.error("Error handling new session:", error);
            }
        } else {
            sendMessage(message, sessionId);
        }
    };

    const sendMessage = async (message, curr) => {
        userScrollingRef.current = false;

        //clear command
        if (message.trim().toLowerCase() === "clear") {
            setMessages((prevMessages) => []);
            return;
        }

        // Update state using functional form to ensure correct state update
        const updatedMessages = [...messages, { content: message, role: "user" }];
        setMessages(updatedMessages);
        const response = await fetch("/api/v1/chat/cancer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: updatedMessages, sessionId: curr }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let done = false;
        //  let currentMessage = "";
        let currentAssistantMessage = { content: "", role: "assistant" };
        setIsLoading(true);
        setMessages((prevMessages) => [...prevMessages, { content: "", role: "assistant" }]);
        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                currentAssistantMessage.content += chunk;
                // currentMessage += chunk;
                // setMessages((prevMessages) => [...prevMessages, { content: chunk, role: "assistant" }]);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content += chunk;
                    return newMessages;
                });
            }
        }
        updatedMessages.push(currentAssistantMessage);
        //session name
        /*
        if (curr && (updatedMessages.length - 2) % 4 === 0) {
            fetch("/api/v1/chat/updateSession", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: updatedMessages, sessionId: curr }),
            })
                .then((response2) => {
                    if (!response2.ok) {
                        throw new Error("Failed to update session");
                    }
                    return response2.json();
                })
                .then((updatedSession) => {
                    // Assuming the response includes the updated session
                    setSessions((prevSessions) =>
                        prevSessions.map((session) => (session._id === updatedSession._id ? updatedSession : session))
                    );
                })
                .catch((error) => {
                    console.error("Error updating session:", error);
                });
        }*/
        setIsLoading(false);
        //
    };
    //pms

    const handleScroll = () => {
        const container = messageContainerRef.current;
        const currentScrollTop = container.scrollTop;

        // Check if the user is scrolling up
        if (currentScrollTop < previousScrollTopRef.current) {
            userScrollingRef.current = true;
            // console.log("scrolled up");
        }

        // Update previous scroll position
        previousScrollTopRef.current = currentScrollTop;
    };

    // Setup scroll event listener
    useEffect(() => {
        const container = messageContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);

            return () => {
                container.removeEventListener("scroll", handleScroll);
            };
        }
    }, []);
    //programatic scroll down
    useEffect(() => {
        if (messageContainerRef.current && !userScrollingRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        // Format as "YYYY-MM-DD HH:MM:SS"
        return `${hours}:${minutes}`;
    };
    //try group
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const groupSessionsByDate = (sessions) => {
        return sessions.reduce((groups, session) => {
            const date = formatDate(session.createdAt);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(session);
            return groups;
        }, {});
    };

    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const isYesterday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        today.setDate(today.getDate() - 1);
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const groupedSessions = groupSessionsByDate(sessions);
    //
    return (
        <div className="dashboard">
            {userInfo && (
                <div className={`sidebar ${sidebarOpen ? "openside" : ""}`}>
                    <div className="s-top ">
                        <button className={`ms-3 border-none bg-transparent `} onClick={() => dispatch(toggleSidebar())}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="icon-xl-heavy me-2"
                            >
                                <path
                                    fill="#b4b4b4"
                                    fillRule="evenodd"
                                    d="M8.857 3h6.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961.058.708.058 1.582.058 2.666v3.286c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C17.1 21 16.227 21 15.143 21H8.857c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C1.5 15.6 1.5 14.727 1.5 13.643v-3.286c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 4.23 3.544c.592-.302 1.233-.428 1.961-.487C6.9 3 7.773 3 8.857 3M6.354 5.051c-.605.05-.953.142-1.216.276a3 3 0 0 0-1.311 1.311c-.134.263-.226.611-.276 1.216-.05.617-.051 1.41-.051 2.546v3.2c0 1.137 0 1.929.051 2.546.05.605.142.953.276 1.216a3 3 0 0 0 1.311 1.311c.263.134.611.226 1.216.276.617.05 1.41.051 2.546.051h.6V5h-.6c-1.137 0-1.929 0-2.546.051M11.5 5v14h3.6c1.137 0 1.929 0 2.546-.051.605-.05.953-.142 1.216-.276a3 3 0 0 0 1.311-1.311c.134-.263.226-.611.276-1.216.05-.617.051-1.41.051-2.546v-3.2c0-1.137 0-1.929-.051-2.546-.05-.605-.142-.953-.276-1.216a3 3 0 0 0-1.311-1.311c-.263-.134-.611-.226-1.216-.276C17.029 5.001 16.236 5 15.1 5zM5 8.5a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1M5 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                        <a href="/cancer" className="bg-transparent border-none me-3 ">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="#b4b4b4"
                                viewBox="0 0 24 24"
                                className="icon-xl-heavy"
                            >
                                <path d="M15.673 3.913a3.121 3.121 0 1 1 4.414 4.414l-5.937 5.937a5 5 0 0 1-2.828 1.415l-2.18.31a1 1 0 0 1-1.132-1.13l.311-2.18A5 5 0 0 1 9.736 9.85zm3 1.414a1.12 1.12 0 0 0-1.586 0l-5.937 5.937a3 3 0 0 0-.849 1.697l-.123.86.86-.122a3 3 0 0 0 1.698-.849l5.937-5.937a1.12 1.12 0 0 0 0-1.586M11 4A1 1 0 0 1 10 5c-.998 0-1.702.008-2.253.06-.54.052-.862.141-1.109.267a3 3 0 0 0-1.311 1.311c-.134.263-.226.611-.276 1.216C5.001 8.471 5 9.264 5 10.4v3.2c0 1.137 0 1.929.051 2.546.05.605.142.953.276 1.216a3 3 0 0 0 1.311 1.311c.263.134.611.226 1.216.276.617.05 1.41.051 2.546.051h3.2c1.137 0 1.929 0 2.546-.051.605-.05.953-.142 1.216-.276a3 3 0 0 0 1.311-1.311c.126-.247.215-.569.266-1.108.053-.552.06-1.256.06-2.255a1 1 0 1 1 2 .002c0 .978-.006 1.78-.069 2.442-.064.673-.192 1.27-.475 1.827a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 21 14.727 21 13.643 21h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.233-.487-1.961C3 15.6 3 14.727 3 13.643v-3.286c0-1.084 0-1.958.058-2.666.06-.729.185-1.369.487-1.961A5 5 0 0 1 5.73 3.545c.556-.284 1.154-.411 1.827-.475C8.22 3.007 9.021 3 10 3A1 1 0 0 1 11 4"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="model-s flex-column small-display">
                        <ul className=" mb-1 model-list">
                            <li className="fw-medium ms-2 ms-sm-3 text-light">Model</li>
                            <li>
                                <a href="/c" className={`chat-history ms-2 fs-5 mb-1 me-2 `}>
                                    FelisAI
                                </a>
                            </li>
                            <li>
                                <a href="/cancer" className={`chat-history ms-2 fs-5 mb-1 me-2 bg-secondary`}>
                                    FelisAI Cancer
                                </a>
                            </li>
                            {userInfo && (
                                <li>
                                    <a href="/askfrompdf" className={`chat-history ms-2 fs-5 mb-1 me-2 `}>
                                        FelisAI PDF
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/*<p className="fw-medium ms-2 ms-sm-3 mb-1" style={{ color: "#b4b4b4" }}>
                            Recents
                        </p>*/}
                    <ul className="session-list">
                        {/*<div className="chat-history ms-2 me-2">New chat</div>*/}
                        {Object.keys(groupedSessions).map((date) => (
                            <React.Fragment key={date}>
                                <li className="fw-medium ms-2 ms-sm-3 mb-1 text-light" style={{ color: "#b4b4b4" }}>
                                    {isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : date}
                                </li>
                                {groupedSessions[date].map((session) => (
                                    <li key={session._id}>
                                        <a
                                            href={`/cancer/${session._id}`}
                                            className="chat-history ms-2 me-2 mb-1"
                                            style={sessionId === session._id ? { backgroundColor: "#3b3b3b" } : null}
                                        >
                                            <div className="ohid">{session.name || formatDateTime(session.createdAt)}</div>
                                        </a>
                                    </li>
                                ))}
                            </React.Fragment>
                        ))}
                        {/*sessions.map((session) => (
                                <li key={session._id}>
                                    <a
                                        href={ischatRoute ? `/c/${session._id}` : `/cancer/${session._id}`}
                                        className="chat-history ms-2 me-2 mb-1"
                                    >
                                        {session.name || formatDateTime(session.createdAt)}
                                    </a>
                                </li>
                            ))*/}
                    </ul>
                </div>
            )}
            <div className="dashboard-main">
                <div ref={messageContainerRef} className="message-container  pe-sm-5 ps-sm-5 pe-2 ps-2">
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            isLoading={isLoading && index === messages.length - 1}
                            Message
                            text={message.content}
                            sender={message.role}
                        />
                    ))}
                </div>
                <Chatinput onSendMessage={handleSendMessage} isLoading={isLoading} modelType={0}></Chatinput>
            </div>
        </div>
    );
};

export default Dashboard2;
