import { useEffect, useState } from "react";
import CodeDocument from "../../document/CodeDocument";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { addDoc, collection, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

interface Props {
  files: any;
  setFiles: any;
  filesInArray: any;
  setFilesInArray: any;
  fileTexts: any;
  setFileTexts: any;
}

const UploadCode = ({
  files,
  setFiles,
  filesInArray,
  setFilesInArray,
  setFileTexts,
}: Props) => {
  return (
    <div>
      <div className=" max-w-7xl mx-auto">
        <label className="flex rounded justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed   appearance-none cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none">
          {filesInArray.length > 0 ? (
            <div className="flex flex-col place-content-center text-center">
              <p className="font-medium text-indigo-500 mt-4">
                Trykk for å endre filene du ønsker å laste opp
              </p>
            </div>
          ) : (
            <span className="flex items-center space-x-2">
              <FileUploadIcon />
              <span className="font-medium text-gray-600">
                Trykk for å legge til filer. F.eks pdf, word, java, python
              </span>
            </span>
          )}
          <input
            type="file"
            name="file_upload"
            className="hidden"
            accept=".py, .java, .pdf, .docx, .doc, .txt, "
            multiple
            onChange={(e: any) => setFiles(e.target.files)}
          />
        </label>
        <div className="mt-2">
          {filesInArray ? (
            <ul className="inline max-w-full">
              {filesInArray.map((file: any, index: number) => {
                return (
                  <li
                    key={index}
                    className="p-2 mt-2 pl-4 pr-4 bg-white text-md text-indigo-500 rounded group bg-indigo-50 hover:bg-red-100 hover:text-red-500 cursor-pointer transition duration-50 ease-in-out"
                    onClick={() => {
                      const newFiles = filesInArray.filter(
                        (file: any) => file !== filesInArray[index]
                      );
                      setFilesInArray(newFiles);
                    }}
                  >
                    {file.name}{" "}
                    <span className="float-right text-red-500 hidden group-hover:inline transition duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                      <DeleteForeverRoundedIcon className="ml-2 text-md" />{" "}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default UploadCode;
