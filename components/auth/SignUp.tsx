import { useContext, useState } from "react";
import { useRouter } from "next/router";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { FileCtx } from "../../pages/_app";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { lastVisitedDoc } = useContext(FileCtx);
  const { createUser } = useFirebaseAuth();
  const router = useRouter();

  const onSubmit = (event: any) => {
    console.log(lastVisitedDoc);
    setErrorMessage(null);
    //check if passwords match. If they do, create user in Firebase
    // and redirect to your logged in page.
    if (passwordOne === passwordTwo) {
      createUser(email, passwordOne)
        .then(async (authUser: any) => {
          await setDoc(doc(db, "users", authUser.user.uid), {
            email: email,
            username: email.replace(/@.*/, ""),
            points: 0,
            downloads: [],
            uploads: [],
            votesArray: [],
          });
          router.push(lastVisitedDoc);
        })
        .catch((error: any) => {
          console.log(error);
          setErrorMessage(error.message);
        });
    } else {
      setErrorMessage("Passordene er ikke like");
    }
    // else setErrorMessage("Password do not match");
    event.preventDefault();
  };

  return (
    <div className="bg-white p-8 max-w-xl m-auto mt-10 shadow-md">
      <div>
        <h1 className="text-3xl mb-8 font-semibold text-indigo-500">
          Registrer deg
        </h1>
        <div>
          <form onSubmit={onSubmit}>
            {errorMessage ? (
              <div className="mt-4">
                <div className="text-red-800 rounded text-md p-4 bg-red-50">
                  {errorMessage}
                </div>
              </div>
            ) : null}{" "}
            <div>
              <div className="col-span-3 sm:col-span-2 mt-8">
                <label
                  htmlFor="signUpEmail"
                  className="block text-md font-medium text-gray-600"
                >
                  {" "}
                  E-post{" "}
                </label>
                <div className="mt-2 flex shadow-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(event: any) => setEmail(event.target.value)}
                    name="email"
                    className="p-2 rounded focus:border-2 outline-0 focus:border-indigo-500 flex-1 block w-full text-gray-600 text-md border-2 border-gray-300"
                    placeholder="ola.nordmann@gmail.com"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="col-span-3 sm:col-span-2 mt-4">
                <label
                  htmlFor="signUpPassword"
                  className="block text-md font-medium text-gray-600"
                >
                  {" "}
                  Passord{" "}
                </label>
                <div className="mt-2 flex  shadow-sm">
                  <input
                    type="password"
                    name="passwordOne"
                    value={passwordOne}
                    onChange={(event: any) =>
                      setPasswordOne(event.target.value)
                    }
                    className="p-2 rounded focus:border-2 utline-0 focus:border-indigo-500 flex-1 block w-full text-gray-600 text-md border-2 border-gray-300"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="col-span-3 sm:col-span-2 mt-4">
                <label
                  htmlFor="signUpPassword2"
                  className="block text-md font-medium text-gray-600"
                >
                  {" "}
                  Gjenta passord{" "}
                </label>
                <div className="mt-2 flex  shadow-sm">
                  <input
                    type="password"
                    name="password"
                    value={passwordTwo}
                    onChange={(event: any) =>
                      setPasswordTwo(event.target.value)
                    }
                    id="signUpPassword2"
                    placeholder="Password"
                    className="p-2 rounded focus:border-2 outline-0 focus:border-indigo-500 flex-1 block w-full text-gray-600 text-md border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>
            <div>
              <div>
                <button className="w-full rounded px-4 py-4 mt-4 text-white bg-indigo-500 border-0  hover:bg-indigo-600 focus:outline-none focus:shadow-outline disabled:opacity-50 text-lg">
                  Registrer deg
                </button>
              </div>
              <div
                className="mt-4 text-center text-gray-500 text-sm"
                style={{ fontSize: "0.875rem" }}
              >
                Har du allerede en konto?{" "}
                <Link href="/logg-inn">
                  <a
                    href="/logg-inn"
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    Logg inn
                  </a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
