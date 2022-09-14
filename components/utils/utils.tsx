import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, index } from "../../firebase/firebase";

const updateDocsFunc = async () => {
  const colorsToChooseFrom = [
    "e9c46a",
    "2a9d8f",
    "e76f51",
    "e63946",
    "219ebc",
    "8338ec",
    "0096c7",
    "f15bb5",
    "f48c06",
    "003566",
  ];
  const querySnapshot = await getDocs(collection(db, "subjects"));
  querySnapshot.forEach(async (d: any) => {
    const docRef = doc(db, "subjects", d.id);
    const chosenColor = colorsToChooseFrom[Math.floor(Math.random() * 10)];
    await updateDoc(docRef, {
      color: chosenColor,
    });
  });
};

const updateDocInVerifiedDocsDbAndAlgolia = async (docRef: any, data: any) => {
  await updateDoc(docRef, data);
  await index.partialUpdateObjects([data]);
  return true;
};

const deleteFromAlgolia = async (id: string) => {
  await index.deleteObject(id);
};
const deleteFromVerifiedDocsDB = async (id: string) => {
  await deleteDoc(doc(db, "verifiedUploads", id));
};

const deleteAlgoliaAndVerifiedDocsDB = async (id: string) => {
  await deleteFromAlgolia(id);
  await deleteFromVerifiedDocsDB(id);
  return true;
};

const prettyExcerpt = (text: string) => {
  let excerpt = text;

  for (let i = 0; i < excerpt.length; i++) {
    if (excerpt[i] === "\n") {
      i++;
      if (excerpt[i + 1] === "\n") {
        excerpt = excerpt.slice(0, i) + excerpt.slice(i + 2);
      }
    }
  }

  const excerptArray = excerpt.split("\n");
  let returnArray: string[] = [];

  // print every line
  excerptArray.forEach((element) => {
    if (element.length > 0) {
      returnArray.push(element);
    }
  });

  return (
    <div>
      {returnArray.map((sentence, index) => {
        return (
          <div key={index}>
            {!sentence.includes(".") ? (
              <>
                {index === 0 ? (
                  <h2
                    className="text-gray-600 mb-10 leading-7 text-lg font-semibold "
                    key={index}
                  >
                    {sentence}
                  </h2>
                ) : (
                  <h4
                    className="text-gray-600 mb-5 leading-7 text-md font-semibold "
                    key={index}
                  >
                    {sentence}
                  </h4>
                )}
              </>
            ) : (
              <p className="text-gray-600 mb-5 leading-7 text-md" key={index}>
                {sentence}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const createUser = async ({ auth, email, password }: any) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      return user.uid;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
};

const downloadDocument = async (
  url: string,
  docId: string,
  uid?: any,
  setUserDownloadPoints?: (p: any) => void
) => {
  window.open(url, "_blank");

  const docRef = doc(db, "verifiedUploads", docId);
  await updateDoc(docRef, {
    downloadCount: increment(1),
  });

  if (uid) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      points: increment(-1),
    }).then((e: any) => {
      // get user info
      getDoc(userRef).then((user: any) => {
        if (user.data() && setUserDownloadPoints) {
          setUserDownloadPoints(user.data().points);
        }
      });
    });
  }
};

const signIn = async (auth: any, email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      return user.uid;

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};

const makeSubjectDb = async (object: any) => {
  Object.keys(object).forEach(async (key) => {
    await setDoc(doc(collection(db, "subjects")), {
      value: object[key].label.toLowerCase(),
    });
  });
};
const makeTypesDb = async (object: any) => {
  Object.keys(object).forEach(async (key) => {
    await setDoc(doc(collection(db, "types")), {
      value: object[key].label.toLowerCase(),
    });
  });
};

const getWindowDimensions = () => {
  if (typeof window !== "undefined") {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  return {
    width: 0,
    height: 0,
  };
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [, windowDimensions]);

  return windowDimensions;
};

const getAllSubjects = async () => {
  const querySnapshot = await getDocs(collection(db, "subjects"));
  return querySnapshot.docs.map((d: any) => {
    return d.data();
  });
};
const getAllTypes = async () => {
  const querySnapshot = await getDocs(collection(db, "types"));
  return querySnapshot.docs.map((d: any) => {
    return d.data();
  });
};

function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}

const prettyPrintSubject = (subject: string) => {
  let value = subject.charAt(0).toUpperCase() + subject.slice(1);
  value = value.replace(" C3 A6", "æ");
  value = value.replace(" C3 B8", "ø");

  if (
    isNumeric(value.substring(3, 6)) &&
    !isNumeric(value.substring(0, 2)) &&
    value.length > 5
  ) {
    value = value.substring(0, 2).toUpperCase() + value.substring(2);
  }
  return value;
};

export default prettyExcerpt;
export {
  createUser,
  updateDocInVerifiedDocsDbAndAlgolia,
  signIn,
  makeSubjectDb,
  makeTypesDb,
  downloadDocument,
  deleteAlgoliaAndVerifiedDocsDB,
  updateDocsFunc,
  useWindowDimensions,
  getAllSubjects,
  getAllTypes,
  prettyPrintSubject,
};
