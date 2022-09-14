import { useContext } from "react";
import { FileCtx } from "../../pages/_app";
import UploadFile from "./UploadFile";

const UploadModal = () => {
  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end sm:items-center justify-center min-h-full p-4  sm:p-0">
          <UploadFile />
        </div>
      </div>
    </div>
  );
};
export default UploadModal;
