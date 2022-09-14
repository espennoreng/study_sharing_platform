import Link from "next/link";
import {
  connectSearchBox,
  Hits,
  HitsPerPage,
  InstantSearch,
  RefinementList,
} from "react-instantsearch-dom";
import ManageSearchSharpIcon from "@mui/icons-material/ManageSearchSharp";
import { useRouter } from "next/router";
import { useState } from "react";
import { searchClient } from "../../firebase/firebase";
import { LinearProgress } from "@mui/material";
import { prettyPrintSubject } from "../utils/utils";

const SubjectSearch = ({ setOpen, open }: any) => {
  const router = useRouter();
  let lastParam = router.asPath.split("/").pop();
  lastParam = lastParam?.replace(/-/g, " ");

  const SearchBox = ({ refine }: any) => {
    const [searchValue, setSearchValue] = useState("");

    const handleRefine = (event: any) => {
      refine(event.target.value);
    };

    const handleKeyDown = (event: any) => {
      if (event.key === "Enter") {
        router.push(`/dokumenter?q=${event.target.value}`);
      }
    };

    return (
      <>
        <div className="flex bg-white rounded items-center p-2 pl-4 pr-4 text-2xl border-2 border-gray-300">
          <ManageSearchSharpIcon className="text-gray-400" fontSize="large" />
          <input
            ref={(input) => input && input.focus()}
            value={searchValue}
            onKeyDown={handleKeyDown}
            type="search"
            onChange={(event) => {
              setSearchValue(event.target.value);
              handleRefine(event);
            }}
            placeholder="Søk ..."
            className="w-full outline-none  p-2 text-xl text-gray-600 bg-none "
          />
        </div>
      </>
    );
  };

  const CustomSearchBox = connectSearchBox(SearchBox);

  const Hit = ({ hit, hitsPerPage }: any) => {
    const [loading, setLoading] = useState(false);

    return (
      <div
        className="h-full  cursor-pointer rounded overflow-hidden "
        key={hit.objectID}
      >
        {loading ? <LinearProgress className=" bg-indigo-500" /> : null}

        <Link href={`/dokumenter/${hit.filePath}/${hit.objectID}`}>
          <div
            className="mb-2 h-full bg-white p-4 rounded hover:border-b-4 hover:shadow border-b-indigo-500"
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

  return (
    <>
      <InstantSearch
        indexName="finnfasit_version_2"
        searchClient={searchClient}
      >
        <div
          onClick={() => {
            setOpen(!open);
          }}
          tabIndex={-1}
          className={`bg-black ${
            open ? "block" : "hidden"
          } opacity-50 fixed top-0 right-0 left-0 p-4 z-50 w-full md:inset-0 h-modal h-full `}
        ></div>
        <div
          className={`fixed  ${
            open ? "block" : "hidden"
          }  rounded top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-gray-100 z-50 p-4 w-full max-w-3xl h-auto `}
        >
          <div className="flex  justify-between items-start p-4 rounded-t border-b ">
            <h3 className="text-xl font-semibold text-indigo-500 ">
              Søk etter ressurser i{" "}
              {lastParam ? prettyPrintSubject(lastParam) : "emnet"}
            </h3>
            <button
              onClick={() => {
                setOpen(!open);
              }}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm p-1.5 ml-auto inline-flex items-center "
              data-modal-toggle="defaultModal"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <CustomSearchBox />
            <div className="mt-4 max-h-96 overflow-auto">
              <Hits hitComponent={Hit} />
              <div className="hidden">
                <RefinementList
                  attribute="subject"
                  defaultRefinement={[lastParam]}
                />
              </div>
            </div>
          </div>
        </div>
      </InstantSearch>
    </>
  );
};
export default SubjectSearch;
