import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Skriv inn e-posten du har registrert deg med."
  );

  const onSubmit = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage(
          "Vi har sendt deg en e-post. Sjekk søppelpost hvis du ikke finner e-posten."
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);

        console.log(errorMessage == "Firebase: Error (auth/invalid-email).");
        if (errorMessage == "Firebase: Error (auth/missing-email).") {
          setMessage("E-postadressen finnes ikke.");
        } else if (errorMessage == "Firebase: Error (auth/invalid-email).") {
          setMessage("Ugyldig e-post format.");
        } else if (errorMessage == "Firebase: Error (auth/user-not-found).") {
          setMessage("Ingen bruker med denne e-postadressen");
        } else {
          console.log("hheeee");
          setMessage(errorMessage);
        }

        // ..
      });
  };

  return (
    <div className="h-screen">
      <div className="bg-white p-8 shadow-md rounded max-w-xl m-auto mt-10">
        <h1 className="text-3xl mb-8 font-semibold text-indigo-500">
          Reset passord{" "}
        </h1>
        {message.length > 1 ? (
          <div className="mt-4 mb-4">
            <div
              className={
                message ==
                "Vi har sendt deg en e-post. Sjekk søppelpost hvis du ikke finner e-posten."
                  ? "text-green-800 rounded text-md p-4 bg-green-50"
                  : "text-red-800 rounded text-md p-4 bg-red-50"
              }
            >
              {message}
            </div>
          </div>
        ) : null}
        <label
          htmlFor="email"
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
        </div>{" "}
        <button
          onClick={() => {
            onSubmit();
          }}
          className="w-full rounded  px-4 py-4 mt-4 text-white bg-indigo-500 border-0  hover:bg-indigo-600 focus:outline-none focus:shadow-outline disabled:opacity-50 text-lg"
        >
          Tilbakestill passord
        </button>{" "}
      </div>
    </div>
  );
};
export default ResetPassword;
