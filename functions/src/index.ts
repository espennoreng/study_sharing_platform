const admin = require("firebase-admin");
const functions = require("firebase-functions");
const path = require("path");
const os = require("os");
const fs = require("fs");
const pdf = require("pdf-parse");
const getDocumentProperties = require("office-document-properties");
const extractText = require("office-text-extractor");

admin.initializeApp();

const createDocument = async (
  excerpt: string | undefined,
  words: number | undefined,
  pages: number | undefined,
  contentType: string,
  fileName: string,
  filePath: any,
  title: string,
  userId: string,
  subject: string,
  type: string,
  grade: string,
  massUpload: string
) => {
  const collectionName = massUpload == "true" ? "confirmUploads" : "uploads";
  admin
    .firestore()
    .collection(collectionName)
    .add({
      name: fileName,
      uid: userId,
      subject: subject,
      title: title,
      type: type,
      grade: grade,
      excerpt: excerpt,
      words: words,
      pages: pages,
      contentType: contentType,
      filePath: filePath,
      created: new Date(),
    })
    .then((docRef: any) => {
      console.log(
        "Document written with ID: ",
        docRef.id + ", at " + massUpload == "true"
          ? "confirmUploads"
          : "uploads" + " collection"
      );
    });
};

const wordOrPDF = (contentType: string) => {
  if (contentType == "application/pdf") {
    return 1;
  } else if (
    contentType ==
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return 0;
  } else {
    console.log("This is not a PDF or word file");
    return -1;
  }
};

const countWords = (str: string) => {
  str = str.replace(/(^\s*)|(\s*$)/gi, "");
  str = str.replace(/[ ]{2,}/gi, " ");
  str = str.replace(/\n /, "\n");
  return str.split(" ").length;
};

export const verifyDoc = functions.storage
  .object()
  .onFinalize(async (object: any) => {
    const fileBucket = object.bucket;
    const contentType = object.contentType;
    const filePath = object.name;
    const bucket = admin.storage().bucket(fileBucket);

    // Doc info

    let pages: number | undefined;
    let words: number | undefined;
    let excerpt: string | undefined;
    let title: string | undefined;
    let subject: string | undefined;
    let type: string | undefined;
    let grade: string | undefined;
    let userId: string | undefined;
    let massUpload: string | undefined;
    const excerptLength = 1000;

    await bucket
      .file(filePath)
      .getMetadata()
      .then((data: any) => {
        title = data[0].metadata.title;
        subject = data[0].metadata.subject;
        type = data[0].metadata.type;
        grade = data[0].metadata.grade;
        userId = data[0].metadata.uid;
        massUpload = data[0].metadata.massUpload;
      })
      .catch((err: any) => {
        console.log(err);
      });

    const getInfoFromPdf = async (tempFilePath: string) => {
      const buffer = fs.readFileSync(tempFilePath);
      const { text, numpages } = await pdf(buffer);
      pages = numpages;
      if (text.length > excerptLength) {
        excerpt = text.substring(0, excerptLength);
      } else {
        excerpt = text;
      }
      words = countWords(text);
      return Promise.resolve(
        excerpt !== null && words !== null && pages !== null && userId !== null
      );
    };

    const getInfoFromWord = async (tempFilePath: string) => {
      const buffer = fs.readFileSync(tempFilePath);
      const text = await extractText(tempFilePath);

      let p = null;
      let w = null;
      let e = null;

      e = text.substring(0, excerptLength);

      await getDocumentProperties.fromBuffer(
        buffer,
        function (err: any, data: any) {
          if (err) throw err;
          p = data.pages;
          w = data.words;
        }
      );

      let counter = 0;
      while (p === null || w === null || (e === null && counter < 10)) {
        counter++;
        await new Promise((r) => setTimeout(r, 500));
      }

      if (w == undefined) {
        w = countWords(text);
      }
      if (p == undefined) {
        p = Math.round(countWords(text) / 400);
      }

      pages = p;
      words = w;
      excerpt = e;
    };

    if (contentType && wordOrPDF(contentType) > -1) {
      const fileName = path.basename(filePath);
      const tempFilePath = path.join(os.tmpdir(), fileName);

      await bucket.file(filePath).download({ destination: tempFilePath });

      if (wordOrPDF(contentType) == 1) {
        const promise = await getInfoFromPdf(tempFilePath);

        if (promise) {
          console.log("Successfully retrieved info from: " + filePath);

          createDocument(
            excerpt ? excerpt : "ukjent",
            words ? words : 0,
            pages ? pages : 0,
            contentType ? contentType : "ukjent",
            fileName ? fileName : "ukjent",
            filePath ? filePath : "ukjent",
            title ? title : "ukjent",
            userId ? userId : "ukjent",
            subject ? subject : "ukjent",
            type ? type : "ukjent",
            grade ? grade : "ukjent",
            massUpload ? massUpload : "false"
          );
        } else {
          console.log("Failed to retrieve info from PDF");
        }
      } else {
        await getInfoFromWord(tempFilePath);

        if (
          pages !== null &&
          excerpt !== null &&
          words !== null &&
          userId !== null
        ) {
          console.log("Successfully retrieved info from: " + filePath);
          createDocument(
            excerpt ? excerpt : "ukjent",
            words ? words : 0,
            pages ? pages : 0,
            contentType ? contentType : "ukjent",
            fileName ? fileName : "ukjent",
            filePath ? filePath : "ukjent",
            title ? title : "ukjent",
            userId ? userId : "ukjent",
            subject ? subject : "ukjent",
            type ? type : "ukjent",
            grade ? grade : "ukjent",
            massUpload ? massUpload : "false"
          );
        } else {
          console.log("Failed to retrieve info from: " + filePath);
        }
      }

      return fs.unlinkSync(tempFilePath);
    } else {
      return "Not a valid file type";
    }
  });
