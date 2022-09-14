import safeJsonStringify from "safe-json-stringify";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import Document from "../../../../components/document/Document";
import Head from "next/head";

export const getServerSideProps = async (ctx: any) => {
  const name = ctx.params.title;
  const subject = ctx.params.subject;

  const q = query(
    collection(db, "verifiedUploads"),
    where("filePath", "==", subject + "/" + name)
  );
  const querySnapshot = await getDocs(q);
  const doc = querySnapshot.docs[0];
  if (doc) {
    const data = JSON.parse(safeJsonStringify(doc.data()));

    return {
      props: {
        data: data,
        id: doc.id,
      },
    };
  }
  return {
    props: {
      data: null,
      id: null,
    },
  };
};

const DocFile = ({ data, id }: any) => {
  return (
    <>
      {data ? (
        <>
          {" "}
          <Head>
            {data.title ? (
              <>
                {" "}
                <title key="title">{"Finnfasit.no - " + data.title}</title>
                <meta
                  property="og:title"
                  content={"Finnfasit.no - " + data.title}
                />
              </>
            ) : null}

            {data.filePath ? (
              <meta
                property="og:url"
                content={"https://finnfasit.no/dokumenter/" + data.filePath}
              />
            ) : null}
            {data.excerpt ? (
              <meta
                property="og:description"
                content={
                  "Finnfasit.no - " +
                  data.excerpt
                    .substring(0, 100)
                    .replace(/\n/g, " ")
                    .replace(/  +/g, " ")
                }
              />
            ) : null}
            {data.subject ? (
              <meta
                name="subject"
                content={
                  data.subject.charAt(0).toUpperCase() + data.subject.slice(1)
                }
              />
            ) : null}

            <meta
              name="keywords"
              content={
                data.subject +
                ", " +
                data.type +
                ", " +
                data.title +
                ", " +
                "finnfasit" +
                ", " +
                "finn fasit" +
                ", " +
                "finn fasit.no"
              }
            />

            <meta name="author" content="Finnfasit" />
          </Head>
          <Document data={data} id={id} />
        </>
      ) : null}
    </>
  );
};

export default DocFile;
