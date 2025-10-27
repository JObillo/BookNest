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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50">
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
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default FineListModal;
