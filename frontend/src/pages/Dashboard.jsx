import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Dashboard = () => {
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [storage, setStorage] = useState({
        used: 0,
        limit: 0,
        remaining: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/images");

            setImages(response.data.images || []);

        } catch (error) {
            console.error("Fetch images error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load images"
            );

        } finally {
            setLoading(false);
        }
    };

    const fetchStorage = async () => {
        try {
            const response = await api.get("/images/storage/usage");

            setStorage(response.data.storage);

        } catch (error) {
            console.error("Storage fetch error:", error);
        }
    };

    useEffect(() => {
        fetchImages();
        fetchStorage();
    }, []);

    const formatBytes = (bytes) => {
        if (!bytes) return "0 MB";

        const mb = bytes / (1024 * 1024);

        if (mb < 1024) {
            return `${mb.toFixed(2)} MB`;
        }

        const gb = mb / 1024;

        return `${gb.toFixed(2)} GB`;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("twoFactorToken");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}

            <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold">
                        PicVault
                    </h1>

                    <p className="text-sm text-gray-500">
                        Secure Image Storage
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                    Logout
                </button>

            </nav>


            {/* Main */}

            <main className="p-8 max-w-7xl mx-auto">

                {/* Header */}

                <div className="flex items-center justify-between mb-8">

                    <div>
                        <h2 className="text-3xl font-bold">
                            My Images
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Manage your stored images
                        </p>
                    </div>

                    <button
                        className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        + Upload Image
                    </button>

                </div>


                {/* Storage Card */}

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

                    <div className="flex justify-between items-center mb-3">

                        <div>
                            <h3 className="font-semibold">
                                Storage
                            </h3>

                            <p className="text-sm text-gray-500">
                                {formatBytes(storage.used)} used of{" "}
                                {formatBytes(storage.limit)}
                            </p>
                        </div>

                        <span className="text-sm text-gray-500">
                            {formatBytes(storage.remaining)} remaining
                        </span>

                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-black rounded-full"
                            style={{
                                width:
                                    storage.limit > 0
                                        ? `${Math.min(
                                            (storage.used /
                                                storage.limit) *
                                            100,
                                            100
                                        )}%`
                                        : "0%"
                            }}
                        />

                    </div>

                </div>


                {/* Error */}

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}


                {/* Loading */}

                {loading && (
                    <p className="text-gray-500">
                        Loading images...
                    </p>
                )}


                {/* Empty State */}

                {!loading && images.length === 0 && !error && (
                    <div className="bg-white rounded-xl p-12 text-center">

                        <h3 className="text-xl font-semibold mb-2">
                            No images yet
                        </h3>

                        <p className="text-gray-500">
                            Upload your first image to get started.
                        </p>

                    </div>
                )}


                {/* Image Grid */}

                {!loading && images.length > 0 && (

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                        {images.map((image) => (

                            <div
                                key={image.id}
                                className="bg-white rounded-xl overflow-hidden shadow-sm"
                            >

                                <div className="aspect-square bg-gray-200">

                                    {image.is_locked ? (

                                        <div className="h-full flex items-center justify-center">

                                            <span className="text-gray-500">
                                                🔒 Locked
                                            </span>

                                        </div>

                                    ) : (

                                        <img
                                            src={image.url}
                                            alt={image.original_name}
                                            className="w-full h-full object-cover"
                                        />

                                    )}

                                </div>

                                <div className="p-4">

                                    <p className="font-medium truncate">
                                        {image.original_name}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatBytes(image.size_bytes)}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
};

export default Dashboard;