import React, { useState } from "react";

const Ask = () => {
    const [files, setFiles] = useState([
        {
            name: "random_text_test.pdf",
            date: "May 1, 2025",
            uploader: { name: "St Ssr", email: "st.ssraip@gmail.com" },
        },
    ]);
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">All Files</h1>

            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-6 text-center">
                <p className="mb-2">
                    Drag and Drop, <span className="underline text-blue-600 cursor-pointer">Upload a file</span> or a{" "}
                    <span className="underline text-blue-600 cursor-pointer">URL</span>
                </p>
                <p className="text-sm text-gray-500">PDF, DOCX, DOC, PPTX, PPT, or TXT</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">🌐 Web site</button>
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">▶️ YouTube</button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-2">
                <button className="border px-4 py-1 rounded hover:bg-gray-100">Add folder</button>
                <div className="flex gap-2">
                    <button className="bg-orange-100 border border-orange-300 px-4 py-1 rounded hover:bg-orange-200">⬆ Upload</button>
                    <button className="bg-brown-700 text-white px-4 py-1 rounded">🗨 Ask all</button>
                </div>
            </div>

            {/* File List */}
            <div className="border-t border-gray-300 mt-4">
                <table className="w-full mt-2 text-sm">
                    <thead>
                        <tr className="text-left text-gray-500">
                            <th className="p-2">Name</th>
                            <th className="p-2">Date created</th>
                            <th className="p-2">Uploaded by</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, idx) => (
                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="p-2 flex items-center gap-2">
                                    <span className="bg-red-600 text-white px-2 rounded text-xs">PDF</span>
                                    {file.name}
                                </td>
                                <td className="p-2">{file.date}</td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                            S
                                        </div>
                                        <div>
                                            <div>{file.uploader.name}</div>
                                            <div className="text-xs text-gray-500">{file.uploader.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <button className="border px-3 py-1 rounded hover:bg-gray-100">Ask</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ask;
