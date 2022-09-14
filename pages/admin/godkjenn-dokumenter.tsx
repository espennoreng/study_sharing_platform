import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import EditDocument from "../../components/admin/EditDocument";
import { getAllSubjects, getAllTypes } from "../../components/utils/utils";
import { db, storage } from "../../firebase/firebase";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";

const VerifyDocuments = () => {
  const [verifiableDocs, setVerifiableDocs] = useState<any[]>([]);
  const [activeDoc, setActiveDoc] = useState<string>("nothing");
  const [types, setTypes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState(true);
  const [newType, setNewType] = useState(true);

  useEffect(() => {
    getAllNotVerifiedDocs();
    getAllSandT();
  }, []);

  const getAllSandT = async () => {
    setTypes(await getAllTypes());
    setSubjects(await getAllSubjects());
  };

  const getAllNotVerifiedDocs = async () => {
    const querySnapshot = await getDocs(collection(db, "confirmUploads"));
    querySnapshot.forEach((doc) => {
      setVerifiableDocs((prev) => [...prev, doc]);
    });
  };

  const acceptDoc = async (d: any) => {
    // add doc to verified collection
    const docRef = doc(db, "confirmUploads", d.id);
    const docSnap = await getDoc(docRef);

    const data = docSnap.data();
    if (data && data.uid !== "unknown") {
      const q = query(
        collection(db, "subjects"),
        where("value", "==", data.subject.toLowerCase())
      ); // find username
      const userRef = doc(db, "users", data.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      await updateDoc(doc(db, "users", data.uid), {
        uploads: arrayUnion("verifiedUploads/" + docSnap.id),
      });

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (subj: any) => {
        // get all the uploaders
        const querySnapshotUploaders = await getDocs(
          collection(db, "subjects", subj.id, "uploaders")
        );

        const uploaders: any[] = [];
        querySnapshotUploaders.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          uploaders.push(doc.id);
        });

        if (uploaders.includes(data.uid)) {
          await updateDoc(doc(db, "subjects", subj.id, "uploaders", data.uid), {
            uploads: arrayUnion("verifiedUploads/" + docSnap.id),
            user: {
              uid: data.uid,
              name: userData ? userData.username : "Anonym",
            },
          });
        } else {
          await setDoc(doc(db, "subjects", subj.id, "uploaders", data.uid), {
            uploads: arrayUnion("verifiedUploads/" + docSnap.id),
            user: {
              uid: data.uid,
              name: userData ? userData.username : "Anonym",
            },
          });
        }
      });
    }

    if (docSnap.exists()) {
      await setDoc(doc(db, "verifiedUploads", docSnap.id), {
        ...docSnap.data(),
        votes: 0,
        downloadCount: 0,
      });
      await deleteDoc(doc(db, "confirmUploads", d.id));
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }

    setVerifiableDocs((prev) => prev.filter((d) => d.id !== d.id));
    getAllNotVerifiedDocs();
  };

  const rejectDoc = async (d: any) => {
    await deleteDoc(doc(db, "confirmUploads", d.id));
    const pathReferance = ref(storage, d.data().filePath);

    deleteObject(pathReferance)
      .then(() => {
        // console.log("deleted");
      })
      .catch((error) => {
        console.log(error);
      });
    setVerifiableDocs((prev) => prev.filter((d) => d.id !== d.id));
    getAllNotVerifiedDocs();
  };

  const downloadDoc = async (d: any) => {
    const pathReferance = ref(storage, d.data().filePath);
    getDownloadURL(pathReferance)
      .then(async (url: string) => {
        window.open(url, "_blank");
      })
      .catch((error: any) => {
        alert(error);
      });
  };

  const editDocHandler = async (d: any) => {
    setNewSubject(true);
    setNewType(true);
    setActiveDoc(d.id);
    subjects.forEach((s) => {
      if (s.value.toLowerCase() === d.data().subject.toLowerCase()) {
        setNewSubject(false);
      }
    });
    types.forEach((t) => {
      if (t.value.toLowerCase() === d.data().type.toLowerCase()) {
        setNewType(false);
      }
    });

    if (d.id == activeDoc) {
      setActiveDoc("");
    }
  };
  const { authUser } = useFirebaseAuth();

  return (
    <>
      {authUser ? (
        authUser.uid == "xJU4QWrF9KSD5wJERKTsVKkclAA2" ? (
          <div className="h-screen m-10">
            <div className="col-span-6 border-2 ">
              <div className="grid grid-cols-12 bg-gray-400">
                <div className="col-span-4 p-2 border-gray-300">
                  <p>Tittel</p>
                </div>
                <div className="col-span-2 p-2 border-gray-300">
                  <p>Emne</p>
                </div>
                <div className="col-span-2 p-2 border-gray-300">
                  <p>Type</p>
                </div>

                <div className="col-span-1 p-2 border-gray-300">
                  <p>Endre</p>
                </div>
                <div className="col-span-1 p-2 border-gray-300">
                  <p>Last ned</p>
                </div>
                <div className="col-span-1 p-2 border-gray-300">
                  <p>Slett</p>
                </div>
                <div className="col-span-1 p-2">
                  <p>Godkjenn</p>
                </div>
              </div>
              <div>
                {verifiableDocs.map((d, index) => (
                  <div key={index}>
                    <div
                      className={
                        index % 2 == 0
                          ? "grid grid-cols-12 bg-gray-100"
                          : "grid grid-cols-12 bg-gray-200"
                      }
                    >
                      <div className="col-span-4 p-2 border-gray-300">
                        <p>{d.data().title}</p>
                      </div>
                      <div className="col-span-2 p-2 border-gray-300">
                        <p>{d.data().subject}</p>
                      </div>
                      <div className="col-span-2 p-2  border-gray-300">
                        <p>{d.data().type}</p>
                      </div>
                      <div className="col-span-1 p-2 border-gray-300">
                        <button
                          onClick={() => editDocHandler(d)}
                          className="bg-indigo-400 p-2 rounded hover:bg-indigo-500"
                        >
                          Endre
                        </button>
                      </div>

                      <div className="col-span-1 p-2 border-gray-300">
                        <button
                          onClick={() => downloadDoc(d)}
                          className="bg-blue-400 p-2 hover:bg-blue-500 rounded"
                        >
                          <p>Last ned</p>
                        </button>
                      </div>
                      <div className="col-span-1 p-2 border-gray-300">
                        <button
                          onClick={() => rejectDoc(d)}
                          className="bg-red-400 p-2 hover:bg-red-500 rounded"
                        >
                          <p>Slett</p>
                        </button>
                      </div>
                      <div className="col-span-1 p-2">
                        <button
                          onClick={() => acceptDoc(d)}
                          className="bg-green-400 p-2 hover:bg-green-500 rounded"
                        >
                          <p>Godkjenn</p>
                        </button>
                      </div>
                    </div>
                    {activeDoc == d.id ? (
                      <EditDocument
                        dID={d.id}
                        newSubject={newSubject}
                        newType={newType}
                        subjects={subjects}
                        types={types}
                        setTypes={setTypes}
                        setSubjects={setSubjects}
                        setNewSubject={setNewSubject}
                        setNewType={setNewType}
                      />
                    ) : null}{" "}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      ) : null}
    </>
  );
};

export default VerifyDocuments;
