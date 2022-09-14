import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";

export const changePathForUploadFile = (subject: string, fileName: string) => {
  const folder = subject
    .toLowerCase()
    .trim()
    .replaceAll(/ +(?= )/g, "")
    .replaceAll("docx", "")
    .replaceAll("pdf", "")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .replaceAll("æ", "a")
    .replaceAll(".", "")
    .replaceAll("-", "_")
    .replaceAll("--", "_")
    .replaceAll("---", "_")
    .replaceAll(" ", "_")
    .replaceAll("__", "_")
    .replaceAll("___", "_")
    .replaceAll("____", "_")
    .replaceAll("_____", "_")
    .replaceAll("_", "-")
    .replaceAll("--", "-")
    .replaceAll("---", "-");

  const name = fileName
    .toLowerCase()
    .trim()
    .replaceAll(/ +(?= )/g, "")
    .replaceAll("docx", "")
    .replaceAll("?", "")
    .replaceAll("pdf", "")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .replaceAll("æ", "a")
    .replaceAll(".", "")
    .replaceAll("-", "_")
    .replaceAll("--", "_")
    .replaceAll("---", "_")
    .replaceAll(" ", "_")
    .replaceAll("__", "_")
    .replaceAll("___", "_")
    .replaceAll("____", "_")
    .replaceAll("_____", "_")
    .replaceAll("_", "-")
    .replaceAll("--", "-")
    .replaceAll("---", "-");

  // slugify the name
  const slugName = name
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/[_]+/g, "-")
    .replace(/^_|_$/g, "");

  const slugSubject = folder
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/[_]+/g, "-")
    .replace(/^_|_$/g, "");

  if (slugSubject.includes('"')) {
    return "newSubjects/" + slugSubject.replaceAll('"', "") + "/" + slugName;
  }

  return slugSubject + "/" + slugName;
};

export const deleteFile = async (document: any) => {
  await deleteDoc(doc(db, "confirmUploads", document.id));
  const fileRef = ref(storage, document.data().filePath);
  deleteObject(fileRef)
    .then(() => {})
    .catch((error) => {
      console.log(error);
    });
};

export const similarity = (s1: string, s2: string) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) /
    parseFloat(longerLength.toString())
  );
};

export const editDistance = (s1: string, s2: string) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

export const getPossibleSubject = (
  filename: string,
  subjectOptions: string[]
) => {
  let lastSuggestion = "";
  let bestSuggestion = "";
  let subjectFoundInFilename = "";

  filename.split(" ").forEach((word, index) => {
    subjectOptions.forEach((subjectOption) => {
      if (subjectOption.toLowerCase().includes(word.toLowerCase())) {
        subjectFoundInFilename = subjectOption;
      }
      let s = similarity(word.toLowerCase(), subjectOption.toLowerCase());
      if (word == "og") {
        const connectedWord =
          filename.split(" ")[index - 1] +
          " " +
          word +
          " " +
          filename.split(" ")[index + 1];
        s = similarity(
          connectedWord.toLowerCase(),
          subjectOption.toLowerCase()
        );
      }
      if (subjectOption.split(" ").length > 1) {
        let wp = 0;
        subjectOption.split(" ").forEach((wordPart) => {
          const sp = similarity(wordPart.toLowerCase(), word.toLowerCase());
          if (sp > wp) {
            wp = sp;
          }
        });
        if (wp > 0.99) {
          bestSuggestion = subjectOption;
        }
      }
      if (word.toLowerCase().includes(subjectOption.toLowerCase())) {
        bestSuggestion = subjectOption;
      }

      if (s > 0.7) {
        lastSuggestion = subjectOption;
      }
    });
  });
  if (subjectFoundInFilename !== "") {
    return subjectFoundInFilename;
  } else if (bestSuggestion !== "") {
    return bestSuggestion;
  }
  return lastSuggestion;
};

export const getPossibleType = (filename: string, typeOptions: string[]) => {
  let value = "";
  filename.split(" ").forEach((word) => {
    typeOptions.forEach((typeOption) => {
      if (similarity(word.toLowerCase(), typeOption) > 0.7) {
        value = typeOption;
      }
      if (typeOption.toLowerCase().includes(word.toLowerCase())) {
        value = typeOption;
      }
    });
  });

  return value;
};

export const handleFileChange = async (
  newFile: any,
  typeOptions: string[],
  subjectOptions: string[]
) => {
  // This changes the name of the file to the title

  const title = await newFile.name
    .replaceAll(".pdf", "")
    .replaceAll(".docx", "")
    .replaceAll("_", " ")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(":", " ")
    .replaceAll("-", " ")
    .replaceAll(".", " ")
    .replaceAll("/", " ")
    .replaceAll("    ", " ")
    .replaceAll("   ", " ")
    .replaceAll("  ", " ");
  const subject = getPossibleSubject(title, subjectOptions);
  const type = getPossibleType(title, typeOptions);

  return new Promise((resolve, reject) => {
    if (subject && type && title) {
      resolve({
        title,
        subject,
        type,
      });
    } else if (subject && type) {
      resolve({
        title: "unknown",
        subject,
        type,
      });
    } else if (subject && title) {
      resolve({
        title,
        subject,
        type: "unknown",
      });
    } else if (title && type) {
      resolve({
        title,
        subject: "unknown",
        type,
      });
    } else if (title) {
      resolve({
        title,
        subject: "unknown",
        type: "unknown",
      });
    } else if (subject) {
      resolve({
        title: "unknown",
        subject,
        type: "unknown",
      });
    } else if (type) {
      resolve({
        title: "unknown",
        subject: "unknown",
        type,
      });
    } else {
      reject("error");
    }
  });
};
export const uploadFile = async (
  files: any,
  userId: string,
  setUploadTried: any,
  typeOptions: string[],
  subjectOptions: string[],
  setLoading?: any,
  grade?: string,
  subject?: string,
  type?: string,
  title?: string,
  massUpload?: boolean,
  setErrorMessage?: any
) => {
  if (files && userId) {
    setUploadTried(true);
    let filePath;
    let storageRef;
    let metadata;
    if (Object.keys(files).length > 1) {
      for (const file of files) {
        const data: any = await handleFileChange(
          file,
          typeOptions,
          subjectOptions
        ).catch((error) => {
          console.log(error);
        });
        filePath = changePathForUploadFile(
          data.subject ? data.subject : "ukjent",
          file.name
        );
        storageRef = ref(storage, filePath);

        await data;

        metadata = {
          contentType: file.type,
          customMetadata: {
            subject: data.subject,
            grade: grade ? grade : "",
            title: data.title,
            type: data.type,
            uid: userId,
            massUpload: massUpload ? "true" : "false",
          },
        };

        await uploadBytes(storageRef, file, metadata)
          .then(() => {
            console.log(
              "Uploaded file " +
                data.title +
                " " +
                data.type +
                " " +
                data.subject
            );
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
      return "success";
    } else if (subject && type && title && grade) {
      setLoading(true);
      filePath = changePathForUploadFile(subject, files.name);
      storageRef = ref(storage, filePath);
      metadata = {
        contentType: files.type,
        customMetadata: {
          subject: subject,
          grade: grade,
          title: title,
          type: type,
          uid: userId,
          massUpload: massUpload ? "true" : "false",
        },
      };
      await uploadBytes(storageRef, files, metadata)
        .then(() => {
          setLoading(false);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  }
  return new Promise((resolve, reject) => {
    if (subject && type && title && grade && userId) {
      resolve({
        subject,
        grade,
        title,
        type,
        userId,
      });
    } else {
      reject("Error");
    }
  });
};
export const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
//Get all subjects and types
export const getSubjects = async (setSubjectOptions: any) => {
  const querySnapshot = await getDocs(collection(db, "subjects"));
  querySnapshot.forEach((d) => {
    setSubjectOptions((prevState: any) => [
      ...prevState,
      capitalizeFirstLetter(d.data().value),
    ]);
  });
};
export const getTypes = async (setTypeOptions: any) => {
  const querySnapshot = await getDocs(collection(db, "types"));
  querySnapshot.forEach((d) => {
    setTypeOptions((prevState: any) => [
      ...prevState,
      capitalizeFirstLetter(d.data().value),
    ]);
  });
};
