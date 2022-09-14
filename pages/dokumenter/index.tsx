import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextPage } from "next";
import { useEffect } from "react";
import SearchAllDocuments from "../../components/search/SearchAlleDocuments";
import { db } from "../../firebase/firebase";

const AlleDokumenter = () => {
  return (
    <div className="min-h-screen">
      <SearchAllDocuments />
    </div>
  );
};

export default AlleDokumenter;
