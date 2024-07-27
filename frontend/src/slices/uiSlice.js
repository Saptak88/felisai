import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebarOpen: localStorage.getItem("sidebarOpen") ? JSON.parse(localStorage.getItem("sidebarOpen")) : true,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
            localStorage.setItem("sidebarOpen", JSON.stringify(state.sidebarOpen));
        },
        setSidebarOpen(state, action) {
            state.sidebarOpen = action.payload;
            localStorage.setItem("sidebarOpen", JSON.stringify(action.payload));
        },
    },
});

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
