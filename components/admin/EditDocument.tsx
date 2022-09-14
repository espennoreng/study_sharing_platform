import { useEffect, useState } from "react";
import { db, storage } from "../../firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { setTimeout } from "timers";
import {
  deleteAlgoliaAndVerifiedDocsDB,
  getAllSubjects,
  getAllTypes,
  updateDocInVerifiedDocsDbAndAlgolia,
} from "../utils/utils";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useRouter } from "next/router";

interface Props {
  dID?: string;
  newSubject?: boolean;
  newType?: boolean;
  types?: any[];
  subjects?: any[];
  setTypes?: (t: any) => void;
  setSubjects?: (s: any) => void;
  setNewSubject?: (s: any) => any;
  setNewType?: (s: any) => any;
}

const EditDocument = ({
  dID,
  newSubject,
  newType,
  subjects,
  types,
  setTypes,
  setSubjects,
  setNewSubject,
  setNewType,
}: Props) => {
  const [d, setD] = useState<any>();
  const [docId, setDocId] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [excerpt, setExcerpt] = useState<string>();
  const [subject, setSubject] = useState<string>();
  const [type, setType] = useState<string>();
  const [pages, setPages] = useState<number>();
  const [grade, setGrade] = useState<string>();
  const [words, setWords] = useState<number>();
  const [docUpdated, setDocUpdated] = useState<boolean>(false);
  const [docDeleted, setDocDeleted] = useState<boolean>(false);
  const { pathname } = useRouter();

  useEffect(() => {
    setDocId(dID);
    if ((subjects && subjects.length > 0) || (types && types.length > 0)) {
      checkIfNewSubject();
      checkIfNewType();
    }
  }, [, subjects, types, type, subject]);

  const checkIfNewSubject = () => {
    if (subjects && setNewSubject && subject) {
      setNewSubject(true);
      subjects.forEach((s) => {
        if (subject.toLowerCase() == s.value.toLowerCase()) {
          setNewSubject(false);
        }
      });
    }
  };

  const checkIfNewType = () => {
    if (types && setNewType && type) {
      setNewType(true);
      types.forEach((s) => {
        if (type.toLowerCase() == s.value.toLowerCase()) {
          setNewType(false);
        }
      });
    }
  };

  const { authUser } = useFirebaseAuth();
  useEffect(() => {
    setDocUpdated(false);
    getEditDoc();
  }, [docId]);

  const getEditDoc = async () => {
    if (docId) {
      let docRef = doc(db, "verifiedUploads", docId);

      if (pathname.split("/")[2] === "godkjenn-dokumenter") {
        docRef = doc(db, "confirmUploads", docId);
      }
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setD(docSnap);
        setTitle(docSnap.data().title);
        setExcerpt(docSnap.data().excerpt);
        setSubject(docSnap.data().subject);
        setType(docSnap.data().type);
        setPages(docSnap.data().pages);
        setWords(docSnap.data().words);
        setGrade(docSnap.data().grade);
      } else {
        setD(null);
      }
    }
  };
  const handleDocIdChange = (e: any) => {
    setD(null);
    setDocId(e.target.value);
  };

  const handleDocUpdate = async () => {
    if (authUser) {
      setDocUpdated(false);
      if (d) {
        let docRef = doc(db, "verifiedUploads", d.id);
        if (pathname.split("/")[2] === "godkjenn-dokumenter") {
          if (setTypes && setSubjects) {
            setSubjects(await getAllSubjects());
            setTypes(await getAllTypes());
            if (newType) {
              await addDoc(collection(db, "types"), {
                value: type,
              });
            }
            if (newSubject) {
              await addDoc(collection(db, "subjects"), {
                value: subject?.toLocaleLowerCase(),
              });
            }
          }

          docRef = doc(db, "confirmUploads", d.id);
          await updateDoc(docRef, {
            title: title,
            excerpt: excerpt,
            subject: subject,
            type: type,
            pages: pages,
            words: words,
            grade: grade,
            objectID: d.id,
          }).then(() => {
            setDocUpdated(true);
            setTimeout(() => {
              setDocUpdated(false);
            }, 3000);
          });
        } else {
          updateDocInVerifiedDocsDbAndAlgolia(docRef, {
            title: title,
            excerpt: excerpt,
            subject: subject,
            type: type,
            pages: pages,
            grade: grade,
            words: words,
            objectID: d.id,
          }).then(() => {
            setDocUpdated(true);
            setTimeout(() => {
              setDocUpdated(false);
            }, 3000);
          });
        }
      }
    } else {
      alert("You must be logged in to update a document");
    }
  };

  const handleDocDelete = async () => {
    // get the user

    if (authUser) {
      const fileRef = ref(storage, d.data().filePath);
      deleteObject(fileRef).catch((e) => {
        alert(e);
      });

      await addDoc(collection(db, "deletedDocs"), {
        ...d.data(),
        lastId: d.id,
        deletedBy: authUser.uid,
        deletedAt: new Date(),
      });

      if (pathname.split("/")[2] === "godkjenn-dokumenter") {
        await deleteDoc(doc(db, "confirmUploads", d.id));
      } else {
        deleteAlgoliaAndVerifiedDocsDB(d.id).then(() => {
          setD(null);
          setDocDeleted(true);
          setTimeout(() => {
            setDocDeleted(false);
          }, 3000);
        });
      }
    } else {
      alert("You must be logged in to delete a document");
    }
  };

  const downloadFileHandler = () => {
    const pathReferance = ref(storage, d.data().filePath);

    getDownloadURL(pathReferance)
      .then((url) => {
        if (authUser) {
          window.open(url, "_blank");
        } else {
          alert("You must be logged in to download a document");
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const handleTypeChange = (e: any) => {
    setType(e.target.value);
  };
  const handleSubjectChange = (e: any) => {
    setSubject(e.target.value);
  };

  return (
    <div
      className={
        pathname.split("/")[2] !== "godkjenn-dokumenter"
          ? "mt-10 mb-10 h-screen"
          : "h-screen"
      }
    >
      <div
        className={
          pathname.split("/")[2] === "godkjenn-dokumenter"
            ? "p-4"
            : "max-w-7xl h-full w-full bg-white rounded shadow m-auto p-4"
        }
      >
        {docUpdated ? (
          <div className="bg-green-100 p-4">
            <p className="text-green-800">Dokumentet er oppdatert!</p>
          </div>
        ) : null}
        {docDeleted ? (
          <div className="bg-red-100 p-4">
            <p className="text-red-800">Dokumentet er slettet!</p>
          </div>
        ) : null}
        {pathname.split("/")[2] !== "godkjenn-dokumenter" ? (
          <>
            {" "}
            <label className="text-gray-600 text-sm">Dokument id</label>
            <input
              type="text"
              className="w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
              placeholder="Document ID"
              onChange={(e) => handleDocIdChange(e)}
            />
          </>
        ) : null}

        <div className="grid grid-cols-12 gap-4 ">
          <div className="col-span-10">
            {d ? (
              <>
                <label className="text-gray-600 text-sm">Tittel</label>
                <input
                  type="text"
                  className="w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                  placeholder="Tittel"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
                <div className="grid grid-cols-12 gap-4 ">
                  <div className="col-span-4">
                    <label
                      className={
                        newSubject
                          ? "text-red-600 text-sm"
                          : "text-gray-600 text-sm"
                      }
                    >
                      {newSubject ? "NYTT EMNE" : "Emne"}
                    </label>

                    <input
                      type="text"
                      className={
                        newSubject
                          ? "w-full p-2 mb-4 outline-none border-2 border-red-500 rounded"
                          : "w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                      }
                      placeholder="Emne"
                      onChange={(e) => handleSubjectChange(e)}
                      value={subject}
                    />
                  </div>
                  <div className="col-span-4">
                    <label
                      className={
                        newType
                          ? "text-red-600 text-sm"
                          : "text-gray-600 text-sm"
                      }
                    >
                      {newType ? "NY TYPE" : "Type"}
                    </label>

                    <input
                      type="text"
                      className={
                        newType
                          ? "w-full p-2 mb-4 outline-none border-2 border-red-500 rounded"
                          : "w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                      }
                      placeholder="Type"
                      onChange={(e) => handleTypeChange(e)}
                      value={type}
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="text-gray-600 text-sm">Karakter</label>

                    <input
                      type="text"
                      className="w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                      placeholder="Karakter"
                      onChange={(e) => setGrade(e.target.value)}
                      value={grade}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4 ">
                  <div className="col-span-6">
                    <label className="text-gray-600 text-sm">
                      Antall sider
                    </label>

                    <input
                      type="text"
                      className="w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                      placeholder="antall sider"
                      onChange={(e) => setPages(Number(e.target.value))}
                      value={pages}
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="text-gray-600 text-sm">Antall ord</label>

                    <input
                      type="text"
                      className="w-full p-2 mb-4 outline-none border-2 border-gray-300 rounded"
                      placeholder="antall ord"
                      onChange={(e) => setWords(Number(e.target.value))}
                      value={words}
                    />
                  </div>
                </div>
                <label className="text-gray-600 text-sm">Utdrag</label>
                <textarea
                  className="w-full p-2 outline-none border-2 border-gray-300 rounded h-full"
                  placeholder="Utdrag"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </>
            ) : null}
          </div>

          <div className="col-span-2 space-y-2 mt-2 ">
            <button
              className="p-2 bg-green-500 w-full hover:bg-green-400 rounded"
              onClick={() => {
                handleDocUpdate();
              }}
            >
              Oppdater
            </button>
            {pathname.split("/")[2] === "godkjenn-dokumenter" ? null : (
              <>
                {" "}
                <button
                  className="p-2 bg-red-500 w-full hover:bg-red-400 rounded"
                  onClick={() => {
                    handleDocDelete();
                  }}
                >
                  Slett
                </button>
                <button
                  className="p-2 bg-blue-500 w-full hover:bg-blue-400 rounded"
                  onClick={() => {
                    downloadFileHandler();
                  }}
                >
                  Last ned
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditDocument;
