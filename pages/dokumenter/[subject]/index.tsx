import { NextPage } from "next";
import ManageSearchSharpIcon from "@mui/icons-material/ManageSearchSharp";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, searchClient } from "../../../firebase/firebase";
import safeJsonStringify from "safe-json-stringify";
import { prettyPrintSubject } from "../../../components/utils/utils";
import { useState } from "react";
import { LinearProgress } from "@mui/material";
import {
  connectHitsPerPage,
  connectSearchBox,
  connectStateResults,
  Hits,
  HitsPerPage,
  InstantSearch,
  RefinementList,
} from "react-instantsearch-dom";
import { useRouter } from "next/router";
import SubjectSearch from "../../../components/search/SubjectSearch";
import Head from "next/head";

//sort givers by uploads

export const getServerSideProps = async (ctx: any) => {
  const subject = ctx.params.subject;

  const q = query(
    collection(db, "subjects"),
    where("value", "==", subject.replace(/-/g, " "))
  );
  const querySnapshot = await getDocs(q);
  const doc = querySnapshot.docs[0];

  // get data from subcollection
  const querySnapshotUploaders = await getDocs(
    collection(db, "subjects", doc.id, "uploaders")
  );
  let uploaders: any = [];
  querySnapshotUploaders.forEach((doc) => {
    const data = JSON.parse(safeJsonStringify(doc.data()));
    if (doc.data().uploads != null) {
      uploaders.push(data);
    }
  });

  if (doc) {
    const data = JSON.parse(safeJsonStringify(doc.data()));

    return {
      props: {
        data: data,
        uploaders: uploaders,
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

const SubDoc: NextPage = ({ data, uploaders, id }: any) => {
  uploaders.sort((a: any, b: any) => b.uploads.length - a.uploads.length);
  const [open, setOpen] = useState(false);

  const Hit = ({ hit, hitsPerPage }: any) => {
    const [loading, setLoading] = useState(false);

    return (
      <div
        className="h-full hover:scale-102 hover:shadow-md cursor-pointer overflow-hidden "
        key={hit.objectID}
      >
        {loading ? <LinearProgress className=" bg-indigo-500" /> : null}

        <Link href={`/dokumenter/${hit.filePath}/${hit.objectID}`}>
          <div
            className="mb-2 h-full bg-white p-4 rounded shadow"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 10000);
            }}
          >
            <div className="">
              <div className="content-center">
                <div className="flex text-gray-500 text-xl ">
                  <p>{hit.title}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const HitsPerPage = ({ items, refine, createURL }: any) => {
    const [toggle, setToggle] = useState(false);

    return (
      <div className="relative w-30">
        <button
          className="text-white text-middle w-full bg-indigo-500 hover:bg-indigo-600 rounded  text-sm px-4 py-2.5 text-center inline-flex items-center"
          type="button"
          onClick={() => {
            setToggle(!toggle);
          }}
        >
          Vis antall{" "}
          <svg
            className="ml-2 w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
        <div
          className={`${
            !toggle ? "hidden" : "block"
          } z-10 w-full bg-white rounded divide-y divide-gray-100 shadow-md absolute `}
        >
          <ul
            className="py-1 text-gray-600   bg-white w-full  rounded"
            aria-labelledby="dropdownDefault"
          >
            {items.map((item: any) => (
              <li
                key={item.value}
                className={
                  "p-2 text-sm w-full cursor-pointer hover:bg-gray-100"
                }
                onClick={(event: any) => {
                  setToggle(!toggle);
                  event.preventDefault();
                  refine(item.value);
                }}
              >
                <a
                  href={createURL(item.value)}
                  style={{ fontWeight: item.isRefined ? "bold" : "" }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const Results = connectStateResults(({ searchState }) => {
    const router = useRouter();
    let lastParam = router.asPath.split("/").pop();
    lastParam = lastParam?.replace(/-/g, " ");

    return searchState ? (
      <div>
        <div id="hits" className="w-full">
          <Hits hitComponent={Hit} />
        </div>

        <div className="hidden">
          <RefinementList
            attribute={"subject"}
            defaultRefinement={[lastParam]}
          />
        </div>
      </div>
    ) : //<div>No query</div>
    null;
  });

  const CustomSearchBox = ({ subject }: any) => {
    const scrollToParagraph = (id: string) => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    };

    // on click focus on element with id "search"
    const handleClick = () => {
      const element = document.getElementById("search");
      element?.focus();
    };

    return (
      <>
        <div
          onClick={() => {
            setOpen(true);
            handleClick();
          }}
          className="flex rounded items-center p-2 pl-4 pr-4 text-2xl bg-white rounded shadow"
        >
          <ManageSearchSharpIcon className="text-gray-400" fontSize="large" />
          <div className="p-2 text-gray-400">
            Søk etter ressurser i{" "}
            {subject
              ? subject.length > 5
                ? subject.substring(0, 5) + "..."
                : subject
              : "emnet"}
          </div>
        </div>
        <div className="flex flex-wrap mt-2 gap-2">
          <button
            onClick={() => scrollToParagraph("short_about")}
            className="text-white w-auto bg-indigo-500 hover:bg-indigo-600 rounded  text-sm px-4 py-2.5 text-center inline-flex items-center "
          >
            Kort om emnet
          </button>
          <button
            onClick={() => scrollToParagraph("other_resources")}
            className="text-white w-auto bg-indigo-500 hover:bg-indigo-600 rounded  text-sm px-4 py-2.5 text-center inline-flex items-center "
          >
            Andre ressurser
          </button>
          <button
            onClick={() => scrollToParagraph("work_about")}
            className="text-white w-auto bg-indigo-500 hover:bg-indigo-600 rounded  text-sm px-4 py-2.5 text-center inline-flex items-center "
          >
            Hvordan jobbe med emnet{" "}
          </button>
          <Link href="/dokumenter">
            <button
              className="text-white w-auto bg-indigo-500 hover:bg-indigo-600 rounded  text-sm px-4 py-2.5 text-center inline-flex items-center "
              type="button"
            >
              Se alle dokumenter
            </button>
          </Link>
        </div>
      </>
    );
  };
  const CustomHitsPerPage = connectHitsPerPage(HitsPerPage);

  return (
    <>
      <Head>
        {data ? (
          <>
            <title>finnfasit.no - {data.value}</title>
            <meta
              name="description"
              content={`Søk etter ressurser i ${data.value}`}
            />

            <meta
              name="keywords"
              content={`finnfasit, ${data.value}, ressurser, emne`}
            />
            <meta
              property="og:title"
              content={`finnfasit.no - ${data.value}`}
            />
            <meta
              property="og:description"
              content={`Søk etter ressurser i ${data.value}`}
            />
            <meta
              property="og:url"
              content={`https://finnfasit.no/dokumenter/${data.value.replace(
                / /g,
                "-"
              )}`}
            />
          </>
        ) : (
          <title>finnfasit.no</title>
        )}
      </Head>
      <div className="h-full">
        <SubjectSearch setOpen={setOpen} open={open} />
        {data ? (
          <InstantSearch
            indexName="finnfasit_version_2"
            searchClient={searchClient}
          >
            <div>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 pl-4 pr-4 ">
                <div className="mx-auto max-w-7xl h-96 grid grid-cols-7 gap-8 content-center">
                  <div className="col-span-7 flex flex-col gap-8  justify-center lg:col-span-4">
                    <h1 className="text-4xl text-white font-semibold lg:text-left md:text-5xl">
                      {prettyPrintSubject(data.value)}
                    </h1>
                    <div className="w-full   items-center ">
                      <CustomSearchBox
                        subject={prettyPrintSubject(data.value)}
                      />
                    </div>
                  </div>
                  <div className="hidden col-span-1  lg:block"></div>
                  <div className="col-span-2 flex flex-col gap-4 hidden lg:block">
                    <div className="bg-white w-full p-2 rounded">
                      <h3 className="text-indigo-500 pb-4 pt-2 pl-2 pr-2 text-2xl font-semibold ">
                        Top bidragsytere
                      </h3>
                      <div className="flex flex-col gap-4 p-4">
                        {uploaders.length > 0 ? (
                          <>
                            {uploaders.map((user: any, index: number) => (
                              <>
                                <div className={`flex `}>
                                  <div className="flex flex-row items-center space-between relative w-full">
                                    <div className="h-12 w-12 rounded overflow-hidden  bg-gray-200">
                                      <img
                                        src="/images/user_icon.png"
                                        alt={user.user.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>

                                    <div className=" pl-4">
                                      <h4 className="text-gray-600  text-md font-medium">
                                        {user.user.name}
                                      </h4>
                                      <p className="text-gray-500 text-sm">
                                        {user.uploads.length} bidrag
                                      </p>
                                    </div>
                                    <div className="right-0 absolute ">
                                      <p className="text-lg font-medium text-gray-500 ">
                                        # {index + 1}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {index == uploaders.length - 1 ? null : (
                                  <div className="h-0.5 rounded w-full bg-gray-200"></div>
                                )}
                              </>
                            ))}
                          </>
                        ) : (
                          <div className={`flex `}>
                            <div className="flex flex-row items-center space-between relative w-full">
                              <div className=" pl-4">
                                <h4 className="text-gray-600  text-md ">
                                  Ingen bidragsytere
                                </h4>
                              </div>
                              <div className="right-0 absolute "></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-4 pr-4 mt-8 mb-8">
                <div className=" max-w-7xl mx-auto">
                  <div className="grid grid-cols-7 lg:col-span-5  gap-4">
                    <div className=" rounded bg-whit col-span-7  ">
                      <div className="flex flex-row gap-4">
                        <h3 className="text-indigo-500 mb-6 text-3xl font-semibold ">
                          Populære dokumenter
                        </h3>
                        <div className="hidden">
                          <CustomHitsPerPage
                            defaultRefinement={9}
                            items={[
                              { value: 9, label: "9" },
                              { value: 18, label: "18" },
                              { value: 100, label: "100" },
                            ]}
                          />
                        </div>
                      </div>
                      <Results />
                    </div>
                    <div className=" w-full rounded col-span-7 md:col-span-5">
                      {data.description ? (
                        <>
                          {" "}
                          <h3
                            className="text-indigo-500 mt-4 text-3xl font-semibold "
                            id="short_about"
                          >
                            Kort om emnet
                          </h3>
                          {data.description
                            .split("newline")
                            .map((p: string, i: number) => (
                              <p
                                key={i}
                                className="text-gray-600 text-lg mt-6 first:mt-0 "
                              >
                                {p}
                              </p>
                            ))}
                        </>
                      ) : null}
                      {data.tips ? (
                        <>
                          <h3
                            className="text-indigo-500  text-3xl font-semibold mt-6"
                            id="how_to_work"
                          >
                            Hvordan jobbe med {data.value}
                          </h3>

                          {data.tips
                            .split("newline")
                            .map((p: string, i: number) => (
                              <p
                                key={i}
                                className="text-gray-600 text-lg mt-6 first:mt-0 "
                              >
                                {p}
                              </p>
                            ))}
                        </>
                      ) : null}

                      {data.resources.length > 0 ? (
                        <>
                          <h3
                            className="text-indigo-500 text-3xl font-semibold mt-6"
                            id="other_resources"
                          >
                            Andre ressurser og kilder
                          </h3>
                          {data.resources.map((resource: string, i: number) => (
                            <div className="flex flex-col mt-4" key={i}>
                              <Link href={resource}>
                                <a
                                  className="text-gray-600 text-lg hover:text-indigo-500"
                                  target="_blank"
                                >
                                  {" "}
                                  <span className="mr-2">
                                    {" "}
                                    <LinkRoundedIcon />
                                  </span>
                                  {resource.length > 40
                                    ? resource.substring(0, 40) +
                                      " " +
                                      resource.substring(40, 80) +
                                      " " +
                                      resource.substring(80, resource.length)
                                    : resource}
                                </a>
                              </Link>
                            </div>
                          ))}
                        </>
                      ) : null}

                      <div className="block md:hidden mt-6">
                        <h3 className="text-indigo-500 mt-6 mb-6 text-3xl font-semibold ">
                          Top bidragsytere
                        </h3>
                        <div className="bg-white w-full rounded ">
                          <div className="flex flex-col gap-4 p-4">
                            {uploaders.length > 0 ? (
                              <>
                                {uploaders.map((user: any, index: number) => (
                                  <div key={index}>
                                    <div className={`flex `}>
                                      <div className="flex flex-row items-center space-between relative w-full">
                                        <div className="h-12 w-12 rounded overflow-hidden  bg-gray-200">
                                          <img
                                            src="/images/user_icon.png"
                                            alt={user.user.name}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>

                                        <div className=" pl-4">
                                          <h4 className="text-gray-600  text-md font-medium">
                                            {user.user.name}
                                          </h4>
                                          <p className="text-gray-500 text-sm">
                                            {user.uploads.length} bidrag
                                          </p>
                                        </div>
                                        <div className="right-0 absolute ">
                                          <p className="text-lg font-medium text-gray-500 ">
                                            # {index + 1}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    {index == uploaders.length - 1 ? null : (
                                      <div className="h-0.5 rounded w-full bg-gray-200"></div>
                                    )}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className={`flex `}>
                                <div className="flex flex-row items-center space-between relative w-full">
                                  <div className=" pl-4">
                                    <h4 className="text-gray-600  text-md ">
                                      Ingen bidragsytere
                                    </h4>
                                  </div>
                                  <div className="right-0 absolute "></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </InstantSearch>
        ) : null}
      </div>
    </>
  );
};

export default SubDoc;
