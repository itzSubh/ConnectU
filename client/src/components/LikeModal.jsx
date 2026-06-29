import React from "react";

const LikesModal = ({ open, users, onClose }) => {

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-[400px] max-h-[500px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b p-4 text-center font-semibold">
                    Likes
                </div>

                <div className="overflow-y-auto max-h-[430px]">

                    {users.map(user => (

                        <div
                            key={user._id}
                            className="flex items-center gap-3 p-4 hover:bg-gray-100"
                        >
                            <img
                                src={user.profile_picture}
                                className="w-11 h-11 rounded-full object-cover"
                            />

                            <div>

                                <h3 className="font-medium">
                                    {user.username}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {user.full_name}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default LikesModal;