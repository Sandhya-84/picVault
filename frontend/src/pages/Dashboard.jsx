
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

    // =========================
    // FETCH IMAGES
    // =========================

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

    // =========================
    // FETCH STORAGE
    // =========================

    const fetchStorage = async () => {
        try {
            const response = await api.get(
                "/images/storage/usage"
            );

            setStorage(response.data.storage);

        } catch (error) {
            console.error(
                "Storage fetch error:",
                error
            );
        }
    };

    // =========================
    // LOAD DASHBOARD
    // =========================

    useEffect(() => {
        fetchImages();
        fetchStorage();
    }, []);

    // =========================
    // FORMAT BYTES
    // =========================

    const formatBytes = (bytes) => {
        if (!bytes) {
            return "0 MB";
        }

        const mb = bytes / (1024 * 1024);

        if (mb < 1024) {
            return `${mb.toFixed(2)} MB`;
        }

        const gb = mb / 1024;

        return `${gb.toFixed(2)} GB`;
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("twoFactorToken");

        navigate("/login");
    };

    // =========================
    // DELETE IMAGE
    // =========================

    const handleDeleteImage = async (imageId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/images/${imageId}`);

            setImages((currentImages) =>
                currentImages.filter(
                    (image) => image.id !== imageId
                )
            );

            fetchStorage();

        } catch (error) {
            console.error(
                "Delete image error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to delete image."
            );
        }
    };

    // =========================
    // RENAME IMAGE
    // =========================

    const handleRenameImage = async (
        imageId,
        currentName
    ) => {
        const newName = window.prompt(
            "Enter new image name:",
            currentName
        );

        if (!newName || !newName.trim()) {
            return;
        }

        try {
            const response = await api.patch(
                `/images/${imageId}/rename`,
                {
                    newName: newName.trim()
                }
            );

            setImages((currentImages) =>
                currentImages.map((image) =>
                    image.id === imageId
                        ? {
                            ...image,
                            ...response.data.image
                        }
                        : image
                )
            );

        } catch (error) {
            console.error(
                "Rename image error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to rename image."
            );
        }
    };

    // =========================
    // DOWNLOAD IMAGE
    // =========================

    const handleDownloadImage = async (imageId) => {
        try {
            setError("");

            const response = await api.get(
                `/images/${imageId}/download`
            );

            const downloadUrl = response.data.url;

            if (!downloadUrl) {
                setError(
                    "Download URL was not generated."
                );
                return;
            }

            window.open(downloadUrl, "_blank");

        } catch (error) {
            console.error(
                "Download image error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to download image."
            );
        }
    };

    // =========================
    // DASHBOARD UI
    // =========================

    return (
        <div className="min-h-screen bg-gray-100">

            {/* NAVBAR */}

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

            {/* MAIN */}

            <main className="p-8 max-w-7xl mx-auto">

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">

                    <div>
                        <h2 className="text-3xl font-bold">
                            My Images
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Manage your stored images
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={() =>
                                navigate("/folders")
                            }
                            className="px-5 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
                        >
                            📁 Folders
                        </button>

                        <button
                            onClick={() =>
                                navigate("/upload")
                            }
                            className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            + Upload Image
                        </button>

                    </div>

                </div>

                {/* STORAGE CARD */}

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

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* LOADING */}

                {loading && (
                    <p className="text-gray-500">
                        Loading images...
                    </p>
                )}

                {/* EMPTY STATE */}

                {!loading &&
                    images.length === 0 &&
                    !error && (

                        <div className="bg-white rounded-xl p-12 text-center">

                            <h3 className="text-xl font-semibold mb-2">
                                No images yet
                            </h3>

                            <p className="text-gray-500">
                                Upload your first image to get started.
                            </p>

                        </div>
                    )}

                {/* IMAGE GRID */}

                {!loading &&
                    images.length > 0 && (

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                            {images.map((image) => (

                                <div
                                    key={image.id}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm"
                                >

                                    {/* IMAGE */}

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

                                    {/* IMAGE DETAILS */}

                                    <div className="p-4">

                                        <p className="font-medium truncate">
                                            {image.original_name}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatBytes(
                                                image.size_bytes
                                            )}
                                        </p>

                                        {/* DELETE */}

                                        <button
                                            onClick={() =>
                                                handleDeleteImage(
                                                    image.id
                                                )
                                            }
                                            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Delete
                                        </button>

                                        {/* RENAME */}

                                        <button
                                            onClick={() =>
                                                handleRenameImage(
                                                    image.id,
                                                    image.original_name
                                                )
                                            }
                                            className="w-full mt-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Rename
                                        </button>

                                        {/* DOWNLOAD */}

                                        <button
                                            onClick={() =>
                                                handleDownloadImage(
                                                    image.id
                                                )
                                            }
                                            disabled={image.is_locked}
                                            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            Download
                                        </button>

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