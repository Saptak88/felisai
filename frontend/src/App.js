import "./App.css";
import Dashboard from "./screens/Dashboard";
import Header from "./components/Header";
import { useState } from "react";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="App">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}></Header>
            <Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}></Dashboard>
        </div>
    );
}

export default App;
