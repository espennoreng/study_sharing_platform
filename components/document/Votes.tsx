import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";

const Votes = ({ data, id }: any) => {
  const [votes, setVotes] = useState(0);
  const [lastVote, setLastVote] = useState<string | null>(null);

  const { authUser } = useFirebaseAuth();

  const getLastVote = async () => {
    if (authUser) {
      const userRef = doc(db, "users", authUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap) {
        const { votesArray }: any = docSnap.data();

        // loop over votesArray and check if docId is in it
        for (const element of votesArray) {
          if (element.includes(id)) {
            const upOrDownVote = element.split("-")[1];
            setLastVote(upOrDownVote);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (data) {
      setVotes(data.votes);
    }
    if (authUser && data) {
      getLastVote();
    }
  }, [, authUser]);

  const addVotesToDoc = async (num: number) => {
    updateVote(num, id);
  };

  const updateVote = async (num: number, docId: string) => {
    const userRef = doc(db, "users", authUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap) {
      const data = docSnap.data();
      if (data) {
        const votesArray = data.votesArray;
        if (votesArray) {
          // loop over votesArray and check if docId is in it
          for (const element of votesArray) {
            if (element.includes(docId)) {
              const upOrDownVote = element.split("-")[1];
              setLastVote(upOrDownVote);
            }
          }
        }
      }

      const upOrDown = num === 1 ? "up" : "down";
      if (upOrDown !== lastVote) {
        setLastVote(upOrDown);
        const docRef = doc(db, "verifiedUploads", id);

        setVotes(votes + num);
        await updateDoc(docRef, {
          votes: votes + num,
        });
        await updateDoc(userRef, {
          votesArray: arrayUnion(docId + "-" + upOrDown),
        });
        await updateDoc(userRef, {
          votesArray: arrayRemove(docId + "-" + lastVote),
        });
      }
    }
  };

  return (
    <>
      <div className="flex flex-row pt-4 justify-between items-center ">
        <p className="text-gray-700 text-lg">Nyttig?</p>
        <div className=" pt-2 pb-2 w-48 rounded grid grid-cols-3 justify-between">
          <div className="flex justify-center">
            <button
              disabled={!authUser || lastVote === "up"}
              onClick={() => {
                addVotesToDoc(1);
              }}
              className={
                lastVote === "up"
                  ? "bg-red-400 p-1 rounded"
                  : "bg-white p-1 hover:bg-gray-100 rounded border-1 border-gray-200"
              }
            >
              <ArrowUpwardIcon
                className={lastVote == "up" ? "text-white" : "text-gray-600"}
              />
            </button>
          </div>
          <div
            className={
              votes > -1
                ? "flex justify-center p-1 text-lg text-green-600 "
                : "flex justify-center p-1 text-lg text-red-600 "
            }
          >
            {votes}
          </div>
          <div className="flex justify-center">
            <button
              disabled={!authUser || lastVote === "down"}
              onClick={() => {
                addVotesToDoc(-1);
              }}
              className={
                lastVote === "down"
                  ? "bg-red-400 p-1 rounded"
                  : "bg-white p-1 hover:bg-gray-100 rounded border-gray-200"
              }
            >
              <ArrowDownwardIcon
                className={lastVote == "down" ? "text-white" : "text-gray-600"}
              />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`bg-indigo-50 p-4 rounded mt-4 text-indigo-900 ${
          !authUser ? "block" : "hidden"
        }`}
      >
        <p>Du må være registrert og logget inn for å stemme.</p>
      </div>
    </>
  );
};
export default Votes;
