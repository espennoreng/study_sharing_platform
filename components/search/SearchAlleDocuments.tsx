import Link from "next/link";
import { useEffect, useState } from "react";
import ManageSearchSharpIcon from "@mui/icons-material/ManageSearchSharp";
import {
  connectSearchBox,
  connectStateResults,
  Hits,
  InstantSearch,
  Highlight,
  connectRefinementList,
  connectToggleRefinement,
} from "react-instantsearch-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, searchClient } from "../../firebase/firebase";
import { Checkbox, LinearProgress } from "@mui/material";
import { useRouter } from "next/router";

const SearchAllDocuments = () => {
  const [subjectAndColor, setSubjectAndColor] = useState(new Map());

  useEffect(() => {
    getSubjects();
  }, []);

  const getSubjects = async () => {
    const querySnapshot = await getDocs(collection(db, "subjects"));
    querySnapshot.forEach(async (d: any) => {
      const data = d.data();
      if (data) {
        setSubjectAndColor(subjectAndColor.set(data.value, data.color));
      }
    });
  };

  const [extentedSubject, setExtentedSubject] = useState(false);
  const subjectResultLimit = extentedSubject ? 1000 : 10;

  const SubjectList = ({
    items,
    isFromSearch,
    refine,
    searchForItems,
    createURL,
    showMore,
  }: any) => {
    const [urlSubject, setUrlSubject] = useState("");
    const { asPath } = useRouter();

    useEffect(() => {
      if (asPath.split("/").length > 2) {
        setUrlSubject(asPath.split("/")[2].replaceAll("-", " "));
        // change the router to the correct url

        refine(
          asPath
            .split("/")[2]
            .replaceAll("-", " ")
            .substring(0, 1)
            .toUpperCase() +
            asPath.split("/")[2].replaceAll("-", " ").substring(1)
        );
      }
    }, [, searchForItems]);

    return (
      <ul>
        <li>
          <input
            type="search"
            placeholder="Søk etter emne"
            className="p-2 w-full border-2 border-gray-200 rounded text-md text-gray-600 mb-2 outline-none"
            onChange={(event) => searchForItems(event.currentTarget.value)}
          />
        </li>
        {items
          .slice(0, subjectResultLimit)
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
          .map((item: any) => (
            <li
              key={item.label}
              className="mb-2 flex items-center "
              onClick={(event) => {
                event.preventDefault();
                refine(item.value);
              }}
            >
              <input
                id="default-checkbox"
                type="checkbox"
                checked={item.isRefined}
                onChange={(event) => {
                  event.preventDefault();
                  refine(item.value);
                }}
                value=""
                className="cursor-pointer w-4 h-4 text-indigo-500 bg-gray-100 rounded border-gray-300 checked:bg-indigo-500 "
              />
              <label
                htmlFor="default-checkbox"
                className="cursor-pointer ml-2 text-md hover:text-indigo-500 text-gray-500 "
              >
                {item.label}{" "}
              </label>
            </li>
          ))}
        {showMore && items.length > subjectResultLimit ? (
          <li className="mt-2 flex flex-row justify-between ">
            <a
              className="text-indigo-500 text-md cursor-pointer "
              onClick={() => {
                setExtentedSubject(!extentedSubject);
              }}
            >
              {extentedSubject ? "Vis mindre" : "Vis flere"}{" "}
            </a>
          </li>
        ) : (
          <li className="mt-2 flex flex-row justify-between ">
            <a
              className="text-indigo-500 text-md cursor-pointer "
              onClick={() => {
                setExtentedSubject(!extentedSubject);
              }}
            >
              {extentedSubject ? "Vis mindre" : "Vis flere"}{" "}
            </a>
          </li>
        )}
      </ul>
    );
  };

  const [extentedType, setExtentedType] = useState(false);
  const typeResultLimit = extentedType ? 1000 : 8;

  const TypeList = ({
    items,
    isFromSearch,
    refine,
    searchForItems,
    showMore,
  }: any) => (
    <ul>
      <li>
        <input
          type="search"
          placeholder="Søk etter type"
          className="p-2 w-full border-2 border-gray-200 rounded text-md text-gray-600 mb-2 outline-none"
          onChange={(event) => searchForItems(event.currentTarget.value)}
        />
      </li>
      {items
        .slice(0, typeResultLimit)
        .sort((a: any, b: any) => a.label.localeCompare(b.label))
        .map((item: any) => (
          <li
            key={item.label}
            className="mb-2 flex items-center "
            onClick={(event) => {
              event.preventDefault();
              refine(item.value);
            }}
          >
            <input
              id="default-checkbox"
              type="checkbox"
              checked={item.isRefined}
              onChange={(event) => {
                event.preventDefault();
                refine(item.value);
              }}
              value=""
              className="cursor-pointer  w-4 h-4  text-indigo-500 bg-gray-100 rounded border-gray-300 checked:bg-indigo-500 "
            />
            <label
              htmlFor="default-checkbox"
              className="cursor-pointer ml-2 text-md hover:text-indigo-500 text-gray-500 "
            >
              {item.label}{" "}
            </label>
          </li>
        ))}
      {showMore && items.length > typeResultLimit ? (
        <li className="mt-2 flex flex-row justify-between ">
          <a
            className="text-indigo-500 text-md cursor-pointer "
            onClick={() => {
              setExtentedType(!extentedType);
            }}
          >
            {extentedType ? "Vis mindre" : "Vis flere"}{" "}
          </a>
        </li>
      ) : (
        <li className="mt-2 flex flex-row justify-between ">
          <a
            className="text-indigo-500 text-md cursor-pointer "
            onClick={() => {
              setExtentedType(!extentedType);
            }}
          >
            {extentedType ? "Vis mindre" : "Vis flere"}{" "}
          </a>
        </li>
      )}
    </ul>
  );

  const CustomSubjectList = connectRefinementList(SubjectList);
  const CustomTypeList = connectRefinementList(TypeList);

  const Hit = ({ hit }: any) => {
    const [color, setColor] = useState("1da1f2");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setColor(subjectAndColor.get(hit.subject.toLowerCase()));
      if (hit.subject.toLowerCase() === "annet") {
        setColor("f23731");
      }
    }, []);

    return (
      <Link href={`/dokumenter/${hit.filePath}/${hit.objectID}`}>
        <div
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 10000);
          }}
          className="  overflow-hidden rounded "
        >
          {loading ? <LinearProgress className="w-full bg-indigo-500" /> : null}
          <div className="relative ease-in-out duration-100 hover:border-b-4 border-indigo-500 shadow-sm bg-white rounded mb-4 cursor-pointer group 	">
            <div className="col-span-11  text-gray-600 p-4 rounded-tr rounded-tl  ">
              <div className="grid grid-cols-12">
                <p className="col-span-11 font-medium text-2xl ">
                  {" "}
                  {hit.title}
                </p>
              </div>
            </div>
            <div className="p-4  ">
              <div className="grid grid-cols-12 gap-4">
                <div className="md:col-span-3 col-span-6 ">
                  <label className="text-indigo-500 text-sm">Emne</label>
                  <Link
                    href={`/dokumenter/${hit.subject
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    <p className="text-gray-600 text-md ">
                      {" "}
                      <span className="underline hover:text-indigo-500">
                        {hit.subject}
                      </span>
                    </p>
                  </Link>
                </div>
                <div className="md:col-span-3 col-span-6">
                  <label className="text-indigo-500 text-sm">Type</label>
                  <p className="text-gray-600 text-md"> {hit.type}</p>
                </div>
                <div className="md:col-span-3 col-span-6">
                  <label className="text-indigo-500 text-sm">
                    Nedlastinger
                  </label>
                  <p className="text-gray-600 text-md"> {hit.downloadCount}</p>{" "}
                </div>
                {!hit.files ? (
                  <div className="md:col-span-3 col-span-6">
                    <label className="text-indigo-500 text-sm">
                      Antall ord
                    </label>
                    <p className="text-gray-600 text-md"> {hit.words}</p>{" "}
                  </div>
                ) : (
                  <div className="md:col-span-3 col-span-6">
                    <label className="text-indigo-500 text-sm">
                      Antall filer
                    </label>
                    <p className="text-gray-600 text-md"> {hit.files}</p>{" "}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const SearchBox = ({ refine }: any) => {
    const { asPath, push } = useRouter();
    const [search, setSearch] = useState("");

    useEffect(() => {
      if (asPath.includes("?q=")) {
        setSearch(asPath.split("?q=")[1].replaceAll("%20", " "));
        refine(asPath.split("?q=")[1].replaceAll("%20", " "));
      }
    }, []);

    const handleRefine = (event: any) => {
      if (search.length > 0) {
        setSearch(event.currentTarget.value);
        refine(search);
      } else {
        setSearch(event.currentTarget.value);
        refine(event.currentTarget.value);
      }
    };

    return (
      <div className="flex rounded  shadow-sm bg-white items-center p-2 pl-4 pr-4 text-xl">
        <ManageSearchSharpIcon className="text-gray-400" fontSize="large" />
        <input
          type="search"
          value={search}
          onChange={(event) => {
            handleRefine(event);
          }}
          placeholder="Søk etter dokumenter"
          className="w-full outline-none p-3 text-lg text-gray-600 bg-none "
        />
      </div>
    );
  };

  const CustomSearchBox = connectSearchBox(SearchBox);

  const Results = connectStateResults(({ searchState, searchResults }: any) =>
    searchResults && searchState && searchResults.nbHits > 0 ? (
      <Hits hitComponent={Hit} />
    ) : (
      <div className="flex flex-col items-center justify-center">
        <p className="text-gray-600 text-md">
          {" "}
          Fant ingen dokumenter med søket ditt :(
        </p>
      </div>
    )
  );

  return (
    <div className="pl-4 pr-4">
      <div className="h-full max-w-7xl  m-auto ">
        <InstantSearch
          indexName="finnfasit_version_2"
          searchClient={searchClient}
        >
          <div className="grid grid-cols-12">
            <div className="hidden  md:block md:col-span-3 mr-4 mt-4 mb-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <CustomSubjectList attribute="subject" searchable showMore />
              </div>

              <div className="bg-white p-4 rounded shadow-sm">
                <CustomTypeList attribute="type" searchable showMore />
              </div>
            </div>
            <div className="col-span-12 md:col-span-9 mt-4 ">
              <div className="mb-4">
                <CustomSearchBox />
              </div>

              <Results />
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
};

export default SearchAllDocuments;
