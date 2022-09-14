import { createContext, useEffect, useState } from "react";
import UploadForm from "./UploadForm";
import UploadProgress from "./UploadProgress";
import UploadValidation from "./UploadValidation";
import FileUploaded from "./FileUploaded";

export const UploadCtx = createContext({
  active: 1,
  setActive: (t: any) => {},
  loading: false,
  setLoading: (t: any) => {},
  file: null as any,
  setFile: (t: any) => {},
  errorMessage: null as any,
  setErrorMessage: (t: any) => {},
  setUploadedfile: (t: any) => {},
  uploadedFile: null as any,
});

const UploadFile = () => {
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [uploadedFile, setUploadedfile] = useState<any>(null);

  useEffect(() => {
    if (errorMessage) {
      setActive(1);
    }
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  }, [errorMessage]);

  const componentToShow = () => {
    switch (active) {
      case 1:
        return <UploadForm />;
      case 2:
        setTimeout(() => {}, 1000);
        return <UploadValidation />;
      case 3:
        setTimeout(() => {}, 1000);
        return <FileUploaded />;
      default:
        return <UploadForm />;
    }
  };

  return (
    <div className="container rounded bg-white max-w-2xl w-full shadow-md mt-8 mb-8 m-auto">
      <UploadCtx.Provider
        value={{
          active,
          setActive,
          loading,
          setLoading,
          file,
          setFile,
          errorMessage,
          setErrorMessage,
          setUploadedfile,
          uploadedFile,
        }}
      >
        <div className="p-6 border-b-2 border-gray-200 ">
          <UploadProgress active={active} />
        </div>

        <div className="p-6">{componentToShow()}</div>
      </UploadCtx.Provider>
    </div>
  );
};
export default UploadFile;
