import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadImage from "./pages/UploadImage";
import Folders from "./pages/Folders";


const VerifyTwoFactor = () => {
    return (
        <div>
            <h1>Verify Two-Factor Authentication</h1>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/verify-two-factor"
                    element={<VerifyTwoFactor />}
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />
                <Route
    path="/upload"
    element={
        <ProtectedRoute>
            <UploadImage />
        </ProtectedRoute>
    }
/>
                <Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    }
/>

        <Route
    path="/folders"
    element={
        <ProtectedRoute>
            <Folders />
        </ProtectedRoute>
    }
/>

            </Routes>

        </BrowserRouter>
    );
}

export default App;