import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import { db, storage } from "../../firebase/firebase";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { FileCtx } from "../../pages/_app";
import UploadModal from "../uploads/UploadModal";
import prettyExcerpt, {
  downloadDocument,
  useWindowDimensions,
} from "../utils/utils";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useRouter } from "next/router";
import Votes from "./Votes";
import CodeDocument from "./CodeDocument";
import Link from "next/link";

const Document = ({ data, id }: any) => {
  const {
    setDownloadFile,
    uploadOpen,
    setUploadOpen,
    userDownloadPoints,
    setUserDownloadPoints,
    setLastVisitedDoc,
  } = useContext(FileCtx);

  const { authUser } = useFirebaseAuth();
  const { push } = useRouter();
  const url = `/dokumenter/${data.filePath}/${id}`;

  const getUserPoints = async () => {
    if (!authUser) {
      return;
    }
    const docRef = doc(db, "users", authUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap) {
      const data = docSnap.data();
      if (data) {
        setUserDownloadPoints(data.points);
      }
    }
  };

  useEffect(() => {
    setLastVisitedDoc(url);
    if (authUser) {
      getUserPoints();
    }
  }, [, authUser, userDownloadPoints]);

  const handleUpload = () => {
    setDownloadFile({ data, id });
    setUploadOpen(true);
  };

  const downloadFileHandler = () => {
    const pathReferance = ref(storage, data.filePath);
    getDownloadURL(pathReferance)
      .then(async (url) => {
        downloadDocument(url, id, authUser.uid, setUserDownloadPoints);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const info: any = {
    Emne: data.subject,
    Type: data.type,
    Karakter: data.grade,
    Nedlastinger: data.downloadCount ? data.downloadCount : 0,
    Ord: data.words,
    Sider: data.pages,
    Opplastet: new Date(data.created.seconds * 1000).toLocaleDateString(
      "no-NO",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    ),
  };

  const codeLanguages: any = {
    py: "Python",
    js: "JavaScript",
    html: "HTML",
    css: "CSS",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    php: "PHP",
    ruby: "Ruby",
    swift: "Swift",
    kotlin: "Kotlin",
    rust: "Rust",
  };

  const infoCode: any = {
    Emne: data.subject,
    Type: data.type,
    Karakter: data.grade,
    Nedlastinger: data.downloadCount ? data.downloadCount : 0,
    Filer: data.files,
    Kodespråk: codeLanguages[data.codeLanguage],
    Opplastet: new Date(data.created.seconds * 1000).toLocaleDateString(
      "no-NO",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    ),
  };

  const InfoDocument = () => {
    if (data.fileTexts) {
      return (
        <div>
          {Object.keys(infoCode).map((key) => (
            <div key={key} className="pb-2 pt-2 first:pt-0  border-b-2">
              <p className="text-indigo-500 pb-1 text-sm">{key}</p>
              <p className="text-gray-700 text-md">{infoCode[key]}</p>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        {Object.keys(info).map((key) => (
          <div key={key} className="pb-2 pt-2 first:pt-0  border-b-2">
            <p className="text-indigo-500 pb-1 text-sm">{key}</p>

            {key == "Emne" ? (
              <Link
                href={
                  "/dokumenter/" + info[key].toLowerCase().replace(/ /g, "-")
                }
              >
                <p className="text-gray-700 text-md underline hover:text-indigo-500 cursor-pointer ">
                  {info[key]}{" "}
                </p>
              </Link>
            ) : (
              <p className="text-gray-700 text-md">{info[key]} </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const InfoDiv = () => {
    return (
      <div>
        <div className="bg-white p-4 mb-4 drop-shadow rounded">
          <div>
            {authUser && userDownloadPoints > 0 ? (
              <div className="flex justify-center bg-green-100 p-4 rounded">
                <p className="text-green-900 ">
                  Du har {userDownloadPoints} poeng tilgjengelig.
                </p>
              </div>
            ) : (
              <div className="flex justify-center bg-indigo-50 p-4 rounded">
                <p className="text-indigo-900 ">
                  Du må laste opp et dokument for å få tilgang til dette
                  dokumentet.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 ">
            <div>
              {" "}
              {authUser && userDownloadPoints > 0 ? (
                <button
                  className="w-full rounded px-4 py-4 text-medium font-normal bg-green-500 text-white hover:bg-green-600"
                  onClick={() => {
                    downloadFileHandler();
                  }}
                >
                  Last ned dokumentet
                </button>
              ) : (
                <button
                  className="w-full rounded px-4 py-4 text-medium font-normal bg-indigo-500 text-white hover:bg-indigo-600"
                  onClick={() => {
                    handleUpload();
                  }}
                >
                  Last opp
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-full bg-white p-4 drop-shadow rounded">
          <InfoDocument />
          <Votes data={data} id={id} />
        </div>
      </div>
    );
  };

  const TitleDiv = () => {
    return (
      <h1 className="text-5xl text-gray-800 mb-8 font-medium">
        {data.title
          .split(" ")
          .map((s: string) =>
            s.length > 15 ? s.slice(0, 15) + "- " + s.slice(15, s.length) : s
          )
          .join(" ")}
      </h1>
    );
  };

  const ExcerptDiv = () => {
    if (!data.fileTexts) {
      return (
        <div className="bg-gray-100 w-full mx-auto pb-1 md:pb-4 md:pl-0">
          <div className="min-h-full bg-white p-4 drop-shadow rounded ">
            <div className="border-b-2 border-b-gray-200 mb-4">
              <div className="pb-2 pt-0">
                <p className="text-indigo-500 pb-2 text-sm">Utdrag</p>
              </div>
            </div>
            {prettyExcerpt(data.excerpt)}...
          </div>
        </div>
      );
    } else {
      return <CodeDocument fileTexts={data.fileTexts} />;
    }
  };

  return (
    <>
      {uploadOpen ? <UploadModal /> : null}
      <div className="pl-4 pr-4">
        {data ? (
          <>
            {useWindowDimensions().width > 1000 ? (
              <div className="max-w-6xl my-10  m-auto h-full">
                <div className="grid grid-cols-12 gap-4 ">
                  <div className="col-span-3">
                    <InfoDiv />
                  </div>

                  <div className="col-span-9">
                    <TitleDiv />
                    <ExcerptDiv />
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl grid-cols-12 container mt-8 m-auto  ">
                <div className="bg-gray-100 col-span-12 md:col-span-3 md:pr-0 ">
                  <TitleDiv />
                  <InfoDiv />
                </div>

                <div className="col-span-12 mt-4">
                  <ExcerptDiv />
                </div>
              </div>
            )}
          </>
        ) : (
          <>data finnes ikke</>
        )}
      </div>
    </>
  );
};

export default Document;
