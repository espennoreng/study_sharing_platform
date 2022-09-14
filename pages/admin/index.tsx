import Link from "next/link";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";

const Admin = () => {
  const { authUser } = useFirebaseAuth();

  return (
    <>
      {authUser && authUser.uid == "xJU4QWrF9KSD5wJERKTsVKkclAA2" ? (
        <div className="pr-10 pl-10 mt-10 m-auto max-w-7xl">
          <ul className="flex flex-row space-x-4 text-md text-gray-600 mb-4">
            <Link href="/admin/godkjenn-dokumenter">
              <li className="p-2 border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                Nye dokumenter
              </li>
            </Link>
            <Link href="/admin/last-opp-dokumenter">
              <li className="p-2 border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                Last opp dokumenter{" "}
              </li>
            </Link>
            <Link href="/admin/oppdater-dokumenter">
              <li className="p-2 border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                Oppdater dokumenter{" "}
              </li>
            </Link>
          </ul>
        </div>
      ) : null}
    </>
  );
};
export default Admin;
