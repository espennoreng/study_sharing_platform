import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { FileCtx } from "../../pages/_app";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const { signIn } = useFirebaseAuth();
  const { lastVisitedDoc } = useContext(FileCtx);

  const onSubmit = (event: any) => {
    setErrorMessage(null);
    signIn(email, password)
      .then(() => {
        if (lastVisitedDoc) {
          router.push(lastVisitedDoc);
        } else {
          router.push("/");
        }
      })
      .catch((error) => {
        //firt letter of error message is capitalized

        setErrorMessage(error.message);
      });
    event.preventDefault();
  };

  return (
    <div className="bg-white p-8 shadow-md rounded max-w-xl m-auto mt-10 ">
      <div>
        <h1 className="text-3xl mb-8 font-semibold text-indigo-500">
          Logg inn
        </h1>
      </div>
      <div>
        <div>
          <form onSubmit={onSubmit}>
            {errorMessage ? (
              <div className="mt-4">
                <div className="text-red-800 rounded text-md p-4 bg-red-50">
                  {errorMessage}
                </div>
              </div>
            ) : null}{" "}
            <div className="col-span-3 sm:col-span-2 mt-4">
              <label
                htmlFor="loginEmail"
                className="block  text-md font-medium text-gray-600"
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
            <div className="col-span-3 sm:col-span-2 mt-4">
              <label
                htmlFor="loginPassword"
                className="block text-md font-medium text-gray-600"
              >
                {" "}
                E-post{" "}
              </label>
              <div className="mt-2 flex shadow-sm">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="p-2 rounded focus:border-2 outline-0 focus:border-indigo-500 flex-1 block w-full text-gray-600 text-md border-2 border-gray-300"
                  placeholder="ola.nordmann@gmail.com"
                />
              </div>
            </div>
            <div>
              <div>
                <button className="w-full rounded  px-4 py-4 mt-4 text-white bg-indigo-500 border-0  hover:bg-indigo-600 focus:outline-none focus:shadow-outline disabled:opacity-50 text-lg">
                  Logg inn
                </button>{" "}
              </div>
            </div>
            <div
              className="mt-4 text-center text-gray-500 text-sm"
              style={{ fontSize: "0.875rem" }}
            >
              Har du ikke en konto?{" "}
              <Link href="/registrer-deg">
                <a className="text-indigo-500 hover:text-indigo-600">
                  Registrer deg
                </a>
              </Link>
            </div>{" "}
            <div
              className="mt-4 text-center text-gray-500 text-sm"
              style={{ fontSize: "0.875rem" }}
            >
              Glemt passord?{" "}
              <Link href="/glemt-passord">
                <a className="text-indigo-500 hover:text-indigo-600">
                  Tilbakestill
                </a>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
