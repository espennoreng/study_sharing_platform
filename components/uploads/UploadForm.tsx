import React, { Fragment, useRef } from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

import { db, storage } from "../../firebase/firebase";
import {
  capitalizeFirstLetter,
  deleteFile,
  getPossibleSubject,
  getPossibleType,
  getSubjects,
  getTypes,
  uploadFile,
} from "./UploadFunctions";
import { UploadCtx } from "./UploadFile";
import { FileCtx } from "../../pages/_app";
import UploadCode from "./uploadCode/UploadCode";
import JSZip from "jszip";
import { ref, uploadBytes } from "firebase/storage";
import { Subject } from "@mui/icons-material";
import Link from "next/link";

const UploadForm = () => {
  const [title, setTitle] = useState<string>("");
  const [subject, setSubject] = useState<any | null>("");
  const [grade, setGrade] = useState<any | null>("Godkjent");
  const [type, setType] = useState<any | null>("");
  const [userId, setUserId] = useState<any>(null);
  const [uploadTried, setUploadTried] = useState<boolean>(false);
  const [subjectOptions, setSubjectOptions] = useState<any>([]);
  const [typeOptions, setTypeOptions] = useState<any>([]);
  const [uploadCode, setUploadCode] = useState(false);
  const { setUserDownloadPoints } = useContext(FileCtx);

  // arrow nav

  // upload code info
  const [files, setFiles] = useState<any>();
  const [filesInArray, setFilesInArray] = useState<any>([]);
  const [fileTexts, setFileTexts] = useState<any>([]);

  const auth = getAuth();
  const {
    setActive,
    loading,
    setLoading,
    file,
    setFile,
    errorMessage,
    setErrorMessage,
    setUploadedfile,
  } = useContext(UploadCtx);

  const { setUploadOpen } = useContext(FileCtx);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
  }, [, uploadTried, title, subject, grade, type]);

  useEffect(() => {
    if (subjectOptions.length < 2 && typeOptions.length < 2) {
      getTypes(setTypeOptions);
      getSubjects(setSubjectOptions);
    }
  }, []);

  useEffect(() => {
    if (files) {
      setFilesInArray([]);

      for (const file of files) {
        setFilesInArray((prev: any) => [...prev, file]);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const text = e.target.result;
          setFileTexts((prev: any) => [
            ...prev,
            { fileName: file.name, content: text.substring(0, 1000) },
          ]);
        };
        reader.readAsText(file);
      }
      setFiles(null);
    }
  }, [files]);

  useEffect(() => {
    if (filesInArray.length < 1) {
      setUploadCode(false);
    }
  }, [filesInArray]);

  const checkIfCompleted = () => {
    if (uploadCode) {
      if (title === "") {
        return "Du må skrive inn en tittel";
      } else if (subject === "") {
        return "Du må velge en fagfelt";
      } else if (type === "") {
        return "Du må velge en type";
      } else if (filesInArray.length < 1) {
        return "Du må laste opp minst en fil";
      } else {
        return 1;
      }
    } else {
      if (file == null) {
        return "Du har ikke valgt en fil.";
      } else if (title == "") {
        return "Du har ikke skrevet inn en tittel.";
      } else if (title.length < 8) {
        return "Tittelen er for kort.";
      } else if (title.length > 100) {
        return "Tittelen er for lang.";
      } else if (type == null) {
        return "Du må velge en type.";
      } else if (grade == null) {
        return "Du må velge en karakter.";
      } else if (subject == null) {
        return "Emnefeltet er for kort.";
      } else if (subject.replaceAll('"', "").length < 4) {
        return "Emnefeltet er for kort.";
      } else if (subject.length > 100) {
        return "Emnefeltet er for langt.";
      } else if (type.replaceAll('"', "").length < 4) {
        return "Typefeltet er for kort.";
      } else {
        return 1;
      }
    }
  };

  const deleteIfShort = async (object: any) => {
    if (object.userId !== null && object.title !== null) {
      const q = query(
        collection(db, "uploads"),
        where("uid", "==", object.userId),
        where("title", "==", object.title),
        orderBy("created", "desc"),
        limit(1)
      );

      setLoading(true);
      onSnapshot(q, (querySnapshot: any) => {
        querySnapshot.forEach(async (d: any) => {
          if (d.data().words < 50) {
            setErrorMessage(
              "Dokumentet du prøver å laste opp oppfyller ikke finnfasit.no sine krav. \nDokumentet inneholder for få ord."
            );
            setTimeout(() => {
              setErrorMessage(null);
            }, 10000);

            deleteFile(d).then(() => {
              setLoading(false);
              return false;
            });
          } else {
            // upload info to db
            if (d.data()) {
              setActive(3);
              setUploadedfile(d.data());
              await setDoc(doc(db, "confirmUploads", d.id), d.data());
              // delete from uploads
              await deleteDoc(doc(db, "uploads", d.id));
            }
            if (object.userId !== "unknown") {
              const userRef = doc(db, "users", object.userId);
              await updateDoc(userRef, {
                points: increment(1),
              }).then((e: any) => {
                // get user info
                getDoc(userRef).then((user: any) => {
                  if (user.data()) {
                    setUserDownloadPoints(user.data().points);
                  }
                });
              });
            }

            setLoading(false);
            return true;
          }
        });
      });
    }
    return true;
  };

  const checkCodeLanguage = (code: any) => {
    let counter: any = {
      py: 0,
      js: 0,
      java: 0,
      c: 0,
      cpp: 0,
      csharp: 0,
    };

    code.forEach((file: any) => {
      if (file.name.includes(".py")) {
        counter.py++;
      } else if (file.name.includes(".js")) {
        counter.js++;
      } else if (file.name.includes(".java")) {
        counter.java++;
      } else if (file.name.includes(".c")) {
        counter.c++;
      } else if (file.name.includes(".cpp")) {
        counter.cpp++;
      } else if (file.name.includes(".csharp")) {
        counter.csharp++;
      }
    });
    // return the highest language
    let highest = "";
    let highestCount = 0;
    for (const key in counter) {
      if (counter[key] > highestCount) {
        highest = key;
        highestCount = counter[key];
      }
    }
    return highest;
  };

  const handleUpload = async () => {
    const check = checkIfCompleted();
    if (check > 0) {
      setActive(2);
      if (uploadCode) {
        setActive(3);
        const upload = {
          title: title,
          name: title
            .replace(/[^a-z0-9]/gi, "-")
            .replace(/[_]+/g, "-")
            .replace(/^_|_$/g, ""),
          filePath:
            subject
              .replace(/[^a-z0-9]/gi, "-")
              .replace(/[_]+/g, "-")
              .replace(/^_|_$/g, "")
              .toLowerCase() +
            "/" +
            title
              .replace(/[^a-z0-9]/gi, "-")
              .replace(/[_]+/g, "-")
              .replace(/^_|_$/g, "")
              .toLowerCase() +
            ".zip",
          subject: subject,
          grade: grade,
          excerpt: "none",
          pages: 0,
          words: 0,
          type: type,
          uid: userId ? userId : "unknown",
          created: new Date(),
          files: filesInArray.length,
          downloadCount: 0,
          votes: 0,
          codeLanguage: checkCodeLanguage(filesInArray),
          // files: filesInArray,
          fileTexts: fileTexts,
          contentType: "application/zip",
        };
        const zip = new JSZip();
        for (const element of filesInArray) {
          zip.file(element.name, element);
        }

        await zip.generateAsync({ type: "blob" }).then(async (content: any) => {
          const storageRef = ref(
            storage,
            subject
              .replace(/[^a-z0-9]/gi, "-")
              .replace(/[_]+/g, "-")
              .replace(/^_|_$/g, "")
              .toLowerCase() +
              "/" +
              title
                .replace(/[^a-z0-9]/gi, "-")
                .replace(/[_]+/g, "-")
                .replace(/^_|_$/g, "")
                .toLowerCase() +
              ".zip"
          );

          await uploadBytes(storageRef, content)
            .then(async (snapshot: any) => {
              if (userId) {
                const userRef = doc(db, "users", userId);
                await updateDoc(userRef, {
                  points: increment(1),
                });
                getDoc(userRef).then((user: any) => {
                  if (user.data()) {
                    setUserDownloadPoints(user.data().points);
                  }
                });
              }
            })
            .catch((error: any) => {
              console.log(error);
            });
        });

        await addDoc(collection(db, "confirmUploads"), upload);
      } else {
        await uploadFile(
          file,
          userId ? userId : "unknown",
          setUploadTried,
          typeOptions,
          subjectOptions,
          setLoading,
          grade,
          subject,
          type,
          title,
          undefined,
          setErrorMessage
        ).then(async (e) => {
          deleteIfShort(e);
        });
      }
    } else {
      setErrorMessage(check);
      setTimeout(() => {
        setErrorMessage(null);
      }, 10000);
    }
  };

  const checkIfSubjectCode = (s: string) => {
    const firstTwoChar = s.substring(0, 2);
    const lastFourChar = s.substring(2, 6);

    const letterMatch = firstTwoChar.match(/([A-Za-z])/g);
    const numberMatch = lastFourChar.match(/^\d+$/);
    if (letterMatch && firstTwoChar.length == 2) {
      if (numberMatch && lastFourChar.length == 4) {
        return true;
      }
    }
    return false;
  };

  const handleFileChange = async (newFiles: any) => {
    // check if any of the files are code files
    let codeFiles = false;
    for (const file of newFiles) {
      if (
        file.name.split(".")[1] === "py" ||
        file.name.split(".")[1] === "js" ||
        file.name.split(".")[1] === "java" ||
        file.name.split(".")[1] === "c" ||
        file.name.split(".")[1] === "cpp" ||
        file.name.split(".")[1] === "csharp"
      ) {
        codeFiles = true;
      }

      // This changes the name of the file to the title
      if (!codeFiles) {
        if (newFiles.length > 1) {
          setUploadCode(false);
          setErrorMessage("Vennligst velg kun én tekstfil");
        } else {
          let fileName = capitalizeFirstLetter(
            newFiles[0].name
              .replace(".pdf", "")
              .replace(".docx", "")
              .replaceAll("_", " ")
              .replaceAll("(", "")
              .replaceAll(")", "")
              .replaceAll(":", " ")
              .replaceAll("-", " ")
              .replaceAll(".", " ")
              .replaceAll("/", " ")
              .replaceAll("    ", " ")
              .replaceAll("   ", " ")
              .replaceAll("  ", " ")
          );

          const nameList = fileName.split(" ");
          nameList.forEach((word: string) => {
            if (checkIfSubjectCode(word)) {
              fileName = fileName.replace(word, word.toUpperCase());
            }
          });

          setFile(newFiles[0]);
          setTitle(fileName);
          setSubject(getPossibleSubject(fileName, subjectOptions));
          setType(getPossibleType(fileName, typeOptions));
        }
      } else {
        setUploadCode(true);
        setFiles(newFiles);
      }
    }
  };

  // Navigate the subject options to the correct subject
  const [activeSubjectOptions, setActiveSubjectOptions] = useState<any>([]);
  const [activeSubject, setActiveSubject] = useState<any>("");
  const [activeCounter, setActiveCounter] = useState<any>(0);

  const [activeTypeOptions, setActiveTypeOptions] = useState<any>([]);
  const [activeType, setActiveType] = useState<any>("");
  const [activeTypeCounter, setActiveTypeCounter] = useState<any>(0);

  const handleArrow = (e: any, comp: string) => {
    if (comp === "subject") {
      if (e.key === "ArrowDown") {
        if (activeCounter < activeSubjectOptions.length - 1) {
          setActiveCounter(activeCounter + 1);
          // set focus on li element
        }
      }
      if (e.key === "ArrowUp") {
        if (activeCounter > 0) {
          setActiveCounter(activeCounter - 1);
        }
      }
      if (e.key === "Enter") {
        if (activeSubjectOptions[activeCounter]) {
          setSubject(activeSubjectOptions[activeCounter]);
          setActiveSubject(activeSubjectOptions[activeCounter]);
          setActiveSubjectOptions([]);
        }
      }
    }
    if (comp === "type") {
      if (e.key === "ArrowDown") {
        if (activeTypeCounter < activeTypeOptions.length - 1) {
          setActiveTypeCounter(activeTypeCounter + 1);
          // set focus on li element
        }
      }
      if (e.key === "ArrowUp") {
        if (activeTypeCounter > 0) {
          setActiveTypeCounter(activeTypeCounter - 1);
        }
      }
      if (e.key === "Enter") {
        if (activeTypeOptions[activeTypeCounter]) {
          setType(activeTypeOptions[activeTypeCounter]);
          setActiveType(activeTypeOptions[activeTypeCounter]);
          setActiveTypeOptions([]);
        }
      }
    }
  };

  useEffect(() => {
    if (activeSubjectOptions.length > 0) {
      setActiveSubject(activeSubjectOptions[activeCounter]);
      if (activeSubjectOptions.length === 1) {
        setActiveSubject(activeSubjectOptions[0]);
      }
    }
    if (activeTypeOptions.length > 0) {
      setActiveType(activeTypeOptions[activeTypeCounter]);
      if (activeTypeOptions.length === 1) {
        setActiveType(activeTypeOptions[0]);
      }
    }
  }),
    [, activeCounter, activeTypeCounter];

  useEffect(() => {
    setActiveSubjectOptions(
      subjectOptions.filter((val: any) => {
        if (val == "") {
          return val;
        } else if (subject == val) {
          return null;
        } else {
          return val.toLowerCase().includes(subject.toLowerCase());
        }
      })
    );
    setActiveTypeOptions(
      typeOptions.filter((val: any) => {
        if (val == "") {
          return val;
        } else if (type == val) {
          return null;
        } else {
          return val.toLowerCase().includes(type.toLowerCase());
        }
      })
    );
  }, [, subject, type]);

  // Navigate the type options to the correct type

  return (
    <div>
      {!userId ? (
        <div className="bg-green-200 p-4 rounded text-green-800 ">
          <Link href="/logg-inn">
            <span className="underline hover:cursor-pointer hover:text-green-900">
              Logg inn
            </span>
          </Link>{" "}
          eller{" "}
          <Link href="/registrer-deg">
            <span className="underline hover:cursor-pointer hover:text-green-900">
              registrer deg
            </span>
          </Link>{" "}
          for å lagre nedlastingspoengene dine!
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-4">
          <div className="text-red-700 rounded text-md p-4 bg-red-50">
            {errorMessage}
          </div>
        </div>
      ) : null}
      <div className="mb-2 ">
        {!uploadCode ? (
          <label className="flex rounded justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed   appearance-none cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none">
            {file ? (
              <div className="flex flex-col place-content-center text-center">
                <p className="font-medium text-indigo-500 ">
                  Trykk for å endre fil, eller laste opp noe annet
                </p>
              </div>
            ) : (
              <span className="flex items-center space-x-2">
                <FileUploadIcon />
                <span className="font-medium text-gray-600">
                  Slipp fil her for å laste opp, eller{" "}
                  <span className="text-indigo-500 underline">utforsk</span>
                </span>
              </span>
            )}
            <input
              type="file"
              name="file_upload"
              multiple
              className="hidden"
              accept=".pdf, .docx, .doc, .java, .py, .cpp, .c, .h, .hpp, .txt"
              onChange={(e: any) => handleFileChange(e.target.files)}
            />
          </label>
        ) : (
          <>
            <UploadCode
              files={files}
              setFiles={setFiles}
              filesInArray={filesInArray}
              setFilesInArray={setFilesInArray}
              fileTexts={fileTexts}
              setFileTexts={setFileTexts}
            />
          </>
        )}
      </div>
      {file ? (
        <div
          className="p-2 mb-4 pl-4 pr-4 bg-white text-md text-indigo-500 rounded group bg-indigo-50 hover:bg-red-100 hover:text-red-500 cursor-pointer transition duration-50 ease-in-out"
          onClick={() => {
            setFile(null);
          }}
        >
          Fil: {file.name}
          <span className="float-right text-red-500 hidden group-hover:inline transition duration-300 ease-in-out opacity-0 group-hover:opacity-100">
            <DeleteForeverRoundedIcon className="ml-2 text-md" />{" "}
          </span>
        </div>
      ) : null}
      <div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <label className="flex flex-col space-y-2">
              <p className="font-medium text-gray-600">Tittel</p>
              <input
                className="w-full rounded px-2 py-2 text-gray-700 bg-white border-2 border-gray-300  appearance-none focus:outline-none focus:border-indigo-400 focus:bg-indigo-50"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTimeout(() => {
                    setSubject(
                      getPossibleSubject(title.toLowerCase(), subjectOptions)
                    );
                    setType(getPossibleType(title.toLowerCase(), typeOptions));
                  }, 100);
                }}
              />
            </label>

            <label className="flex flex-col space-y-2">
              <p className="font-medium text-gray-600">Karakter</p>
              <select
                className="w-full rounded px-2 py-2  text-gray-700 bg-white border-2 border-gray-300  appearance-none focus:outline-none focus:border-indigo-400 focus:bg-indigo-50"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">Velg karakter</option>
                <option value="A/6">A/6</option>
                <option value="A/6">B/5</option>
                <option value="C/4">C/4</option>
                <option value="Godkjent">Godkjent</option>
                <option value="Ingen karakter">Ingen karakter</option>
                <option value="Ikke oppgi">Ikke oppgi</option>
              </select>
            </label>
            <label className=" flex flex-col space-y-2">
              <p className="font-medium text-gray-600">Velg emne</p>
              <div>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    handleArrow(e, "subject");
                  }}
                  placeholder="Søk, eller legg til emne"
                  className="peer p-2 w-full  border-2 border-gray-300 rounded outline-0 focus:outline-none focus:border-indigo-400 focus:bg-indigo-50"
                  value={subject}
                  onChange={(e: any) => setSubject(e.target.value)}
                />

                <ul className="hidden  active:block peer-focus:block shadow-md max-h-44 overflow-auto">
                  {subjectOptions
                    .filter((val: any) => {
                      //set first letter to upper case

                      if (val == "") {
                        return val;
                      } else if (subject == val) {
                        return null;
                      } else {
                        return val
                          .toLowerCase()
                          .includes(subject.toLowerCase());
                      }
                    })
                    .map((subject: string, index: number) => {
                      return (
                        <li
                          id={"subject" + index}
                          tabIndex={index}
                          key={index}
                          className={`text-gray-500 cursor-pointer hover:bg-gray-100 p-2 ${
                            activeSubject == activeSubjectOptions[index]
                              ? "bg-gray-100"
                              : ""
                          }`}
                          onClick={() =>
                            setSubject(
                              subject.substring(0, 1).toUpperCase() +
                                subject.substring(1)
                            )
                          }
                        >
                          {subject}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </label>
            <label className=" flex flex-col space-y-2">
              <p className="font-medium text-gray-600">Velg type</p>
              <div>
                <input
                  type="text"
                  placeholder="Søk, eller legg til type"
                  className="peer p-2 w-full border-2 border-gray-300 rounded outline-0 focus:outline-none focus:border-indigo-400 focus:bg-indigo-50"
                  value={type}
                  onKeyDown={(e) => {
                    handleArrow(e, "type");
                  }}
                  onChange={(e: any) => setType(e.target.value)}
                />

                <ul className="hidden active:block peer-focus:block  rounded shadow-md max-h-44 overflow-auto">
                  {typeOptions
                    .filter((val: any) => {
                      //set first letter to upper case

                      if (val == "") {
                        return val;
                      } else if (type == val) {
                        return null;
                      } else {
                        return val.toLowerCase().includes(type.toLowerCase());
                      }
                    })
                    .map((type: string, index: number) => {
                      return (
                        <li
                          key={index}
                          className={`text-gray-500 cursor-pointer hover:bg-gray-100 p-2 ${
                            activeType == activeTypeOptions[index]
                              ? "bg-gray-100"
                              : ""
                          }`}
                          onClick={() =>
                            setType(
                              type.substring(0, 1).toUpperCase() +
                                type.substring(1)
                            )
                          }
                        >
                          {type}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-4 ">
        <button
          onClick={() => {
            setUploadOpen(false);
          }}
          disabled={loading}
          className="w-full rounded px-4 py-4 mt-4 text-indigo-500 bg-white border-2 border-indigo-500  hover:bg-indigo-500 hover:text-white focus:outline-none focus:shadow-outline disabled:opacity-50 text-md"
        >
          Avbryt
        </button>
        <button
          disabled={loading}
          onClick={!loading ? () => handleUpload() : () => {}}
          className="w-full rounded   mt-4 text-white bg-indigo-500 border-0  hover:bg-indigo-600 focus:outline-none focus:shadow-outline disabled:opacity-50 text-md"
        >
          {loading ? "Vent mens vi validerer dokumentet..." : "Last opp"}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
