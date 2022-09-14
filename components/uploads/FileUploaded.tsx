import { getDownloadURL, ref } from "firebase/storage";
import Link from "next/link";
import React, { useContext } from "react";
import { storage } from "../../firebase/firebase";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { FileCtx } from "../../pages/_app";
import { downloadDocument } from "../utils/utils";
const FileUploaded = () => {
  const { downloadFile, setUploadOpen, setUserDownloadPoints } =
    useContext(FileCtx);
  const { authUser } = useFirebaseAuth();

  const downloadFileHandler = () => {
    const pathReferance = ref(storage, downloadFile.data.filePath);
    getDownloadURL(pathReferance)
      .then((url) => {
        if (authUser) {
          downloadDocument(
            url,
            downloadFile.id,
            authUser.uid,
            setUserDownloadPoints
          );
        } else {
          downloadDocument(url, downloadFile.id);
        }
        setUploadOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div>
        {" "}
        <h2 className="text-gray-600 text-4xl text-center mb-4">
          Takk for opplastingen!
        </h2>
      </div>

      {!authUser ? (
        <div className="pt-4 pb-2 text-center">
          <p className="text-gray-600">
            Hvis du ønsker å ta vare på nedlastingspoengene dine må du{" "}
            <Link href="/logg-inn">
              <span className="text-indigo-500 cursor-pointer hover:text-indigo-600">
                logge inn.
              </span>
            </Link>
          </p>
        </div>
      ) : null}

      <div className="flex flex-col  sm:flex-row sm:space-x-4 ">
        <button
          onClick={() => {
            setUploadOpen(false);
          }}
          className="w-full rounded px-4 py-4 mt-4 text-indigo-500 bg-white border-2 border-indigo-500  hover:bg-indigo-500 hover:text-white focus:outline-none focus:shadow-outline disabled:opacity-50 text-md"
        >
          Avbryt
        </button>
        <button
          onClick={() => {
            downloadFileHandler();
          }}
          className="w-full rounded px-4 py-4 mt-4 text-white bg-green-500 border-0  hover:bg-green-600 focus:outline-none focus:shadow-outline disabled:opacity-50 text-md"
        >
          Last ned dokument
        </button>
      </div>
    </>
  );
};
export default FileUploaded;
