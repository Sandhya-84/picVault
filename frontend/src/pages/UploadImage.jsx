import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const UploadImage = () => {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        setError("");
        setSuccess("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Only JPEG, PNG, and WEBP images are allowed.");
            setFile(null);
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("Image size must be less than 10 MB.");
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select an image.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("image", file);

            await api.post("/images/upload", formData);

            setSuccess("Image uploaded successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            console.error("Upload error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to upload image."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8">

                <h1 className="text-2xl font-bold">
                    Upload Image
                </h1>

                <p className="text-gray-500 mt-1 mb-6">
                    Upload an image to your PicVault storage.
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">
                        {success}
                    </div>
                )}

                <form onSubmit={handleUpload}>

                    <label className="block text-sm font-medium mb-2">
                        Select Image
                    </label>

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="w-full border rounded-lg p-3"
                    />

                    {file && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <p className="font-medium truncate">
                                {file.name}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Upload Image"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="w-full mt-3 border py-3 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                </form>

            </div>

        </div>
    );
};

export default UploadImage;