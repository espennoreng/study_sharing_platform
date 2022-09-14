import ManageSearchSharpIcon from "@mui/icons-material/ManageSearchSharp";

import {
  InstantSearch,
  Hits,
  connectSearchBox,
  connectStateResults,
  HitsPerPage,
} from "react-instantsearch-dom";
import React, { useState } from "react";
import Link from "next/link";
import { LinearProgress } from "@mui/material";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import { useRouter } from "next/router";
import { searchClient } from "../../firebase/firebase";

const SearchHomePage = () => {
  const Hit = ({ hit, hitsPerPage }: any) => {
    const [loading, setLoading] = useState(false);
    return (
      <Link href={`/dokumenter/${hit.filePath}/${hit.objectID}`}>
        <div
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 10000);
          }}
        >
          {" "}
          {loading ? <LinearProgress className="w-full bg-indigo-500" /> : null}
          <div className="relative  ease-in-out duration-100 p-4  hover:p-5 cursor-pointer hover:bg-gray-100 group focus:bg-blue-500">
            <div className="content-center">
              <div className="flex text-gray-500 text-lg ">
                <p>
                  <span className="mr-2">
                    <ArticleRoundedIcon />
                  </span>
                  {"   "}
                  {hit.title}
                </p>{" "}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const router = useRouter();

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
      <div className="flex rounded border-b-2 border-gray-100 items-center p-2 pl-4 pr-4 text-xl">
        <ManageSearchSharpIcon className="text-gray-400" fontSize="large" />
        <input
          value={searchValue}
          onKeyDown={handleKeyDown}
          type="search"
          onChange={(event) => {
            setSearchValue(event.target.value);
            handleRefine(event);
          }}
          placeholder="Søk etter sammendrag, eksamensoppgaver, analyser, obliger, etc."
          className="w-full outline-none p-3 text-lg text-gray-600 bg-none "
        />
      </div>
    );
  };

  const CustomSearchBox = connectSearchBox(SearchBox);

  const Results = connectStateResults(({ searchState }) => {
    return searchState && searchState.query ? (
      <div className="overflow-auto max-h-96	">
        <Hits hitComponent={Hit} />
        <div
          onClick={() => {
            router.push(`/dokumenter?q=${searchState.query}`);
          }}
          className="pl-4 p-2 text-md text-indigo-500 hover:text-indigo-600 cursor-pointer"
        >
          Vis mer
        </div>
      </div>
    ) : //<div>No query</div>
    null;
  });

  return (
    <div className="min-h-screen pt-12 w-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-400 ">
      <InstantSearch
        indexName="finnfasit_version_2"
        searchClient={searchClient}
      >
        {" "}
        <div className="text-center mb-10 pl-4 pr-4">
          <h1 className="text-4xl md:text-5xl text-white font-semibold">
            Finn studiedokumentene du trenger
          </h1>
          <h2 className="text-xl mt-5 text-white">
            Dokumenter lastet opp av studenter, for studenter
          </h2>
        </div>
        <div className="m-auto max-w-4xl pb-10">
          <div className="shadow-sm rounded bg-white  m-4">
            <div className="hidden">
              <HitsPerPage
                defaultRefinement={5}
                items={[{ value: 5, label: "10" }]}
              />
            </div>
            <CustomSearchBox />
            <Results />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default SearchHomePage;
