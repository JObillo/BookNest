import React from "react";

type FineListModalProps = {
  show: boolean;
  patronName?: string;
  onConfirm: () => void;
  onClose: () => void;
};

const FineListModal: React.FC<FineListModalProps> = ({
  show,
  patronName,
  onConfirm,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-3">Confirm Action</h2>
        <p className="mb-4">
          Are you sure you want to mark the fine for{" "}
          <span className="font-semibold">{patronName}</span> as{" "}
          <span className="text-green-600 font-semibold">cleared</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full md:w-auto py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full md:w-auto py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default FineListModal;
