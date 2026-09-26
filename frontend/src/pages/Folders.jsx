import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Folders = () => {
    const navigate = useNavigate();

    const [folders, setFolders] = useState([]);
    const [folderName, setFolderName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFolders = async () => {
        try {
            setLoading(true);

            const response = await api.get("/folders");

            setFolders(response.data.folders || []);

        } catch (error) {
            console.error("Fetch folders error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load folders."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleCreateFolder = async (e) => {
        e.preventDefault();

        if (!folderName.trim()) {
            return;
        }

        try {
            await api.post("/folders", {
                name: folderName.trim()
            });

            setFolderName("");

            fetchFolders();

        } catch (error) {
            console.error("Create folder error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create folder."
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-bold">
                        PicVault
                    </h1>

                    <p className="text-sm text-gray-500">
                        Folders
                    </p>
                </div>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    Dashboard
                </button>

            </nav>

            <main className="max-w-6xl mx-auto p-8">

                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        My Folders
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Organize your images into folders.
                    </p>

                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleCreateFolder}
                    className="bg-white rounded-xl p-6 shadow-sm mb-8"
                >

                    <h3 className="font-semibold mb-4">
                        Create New Folder
                    </h3>

                    <div className="flex gap-3">

                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) =>
                                setFolderName(e.target.value)
                            }
                            placeholder="Folder name"
                            className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />

                        <button
                            type="submit"
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Create
                        </button>

                    </div>

                </form>

                {loading ? (
                    <p className="text-gray-500">
                        Loading folders...
                    </p>
                ) : folders.length === 0 ? (

                    <div className="bg-white rounded-xl p-12 text-center">

                        <h3 className="text-xl font-semibold">
                            No folders yet
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Create your first folder to organize your images.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

                        {folders.map((folder) => (

                            <div
                                key={folder.id}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer"
                            >

                                <div className="text-4xl mb-4">
                                    📁
                                </div>

                                <h3 className="font-semibold truncate">
                                    {folder.name}
                                </h3>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
};

export default Folders;