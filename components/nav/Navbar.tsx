import { Disclosure } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";
import { useEffect } from "react";
import { prettyPrintSubject } from "../utils/utils";

//TODO: fix the router error

const Navbar = () => {
  const { authUser, signOut } = useFirebaseAuth();
  const router = useRouter();

  let params: string[] = router.asPath.split("/");
  let id: any = null;

  useEffect(() => {
    if (params[1] === "") {
      params.pop();
    }
  }, []);

  if (params.length == 5) {
    id = params.pop();
  }

  return (
    <>
      <Disclosure
        as="nav"
        className="white bg-white shadow pb-1 pt-1 pl-4 pr-4 "
      >
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto ">
              <div className="relative flex items-center justify-between h-16 ">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2  text-gray-400 hover:text-white hover:bg-indigo-500 focus:outline-none ">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <a
                      key={"Hjem"}
                      href={"/"}
                      className="block h-8 w-auto text-2xl text-indigo-500 font-semibold  "
                    >
                      Finnfasit.no
                    </a>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-2 items-center justify-center ">
                      <Link href={"/dokumenter"}>
                        <a
                          key={"Dokumenter"}
                          className={
                            "text-gray-500  hover:text-indigo-500 px-6 py-3 rounded text-medium font-normal cursor-pointer"
                          }
                        >
                          Utforsk alle dokumenter
                        </a>
                      </Link>{" "}
                      {authUser ? (
                        <Link href={"/logg-inn"}>
                          <a
                            key={"Logg ut"}
                            onClick={() => {
                              signOut();
                            }}
                            className={
                              "text-indigo-500 border-2 rounded border-indigo-500  hover:bg-indigo-500 hover:text-white px-6 py-3 rounded text-medium font-normal cursor-pointer"
                            }
                          >
                            Logg ut
                          </a>
                        </Link>
                      ) : (
                        <Link href={"/logg-inn"}>
                          <a
                            key={"Logg inn"}
                            href={"/logg-inn"}
                            className={
                              "text-indigo-500 rounded border-2 border-indigo-500  hover:bg-indigo-500 hover:text-white  px-6 py-3 rounded text-medium font-normal"
                            }
                          >
                            Logg inn
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Disclosure.Button
                  key={"Logg inn"}
                  as="a"
                  href={"/logg-inn"}
                  className={
                    "block text-gray-400 hover:bg-indigo-500 hover:text-white block px-4 py-2 rounded text-medium font-normal"
                  }
                >
                  Logg inn
                </Disclosure.Button>
                <Disclosure.Button
                  key={"dokumenter"}
                  as="a"
                  href={"/dokumenter"}
                  className={
                    "block text-gray-400 hover:bg-indigo-500 hover:text-white block px-4 py-2 rounded text-medium font-normal"
                  }
                >
                  Utforsk alle dokumenter
                </Disclosure.Button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div className="hidden">
        {params.length > 1 ? (
          <div
            className={`${
              params[1] == "" ? "hidden" : "block"
            } pl-4 pr-4 bg-white border-b-2`}
          >
            <div className=" text-gray-600   bg-white">
              <div className="max-w-7xl mx-auto py-1 pl-4 md:pl-0  hidden md:block ">
                <div className="inline">
                  {" "}
                  <Link href={"/"}>
                    <HomeIcon className="text-gray-400 hover:text-indigo-500 cursor-pointer mr-2" />
                  </Link>
                </div>
                {params.map((param, index) => {
                  if (index === 0) {
                    return null;
                  }
                  if (index == params.length - 1) {
                    return (
                      <div className="inline-block" key={index}>
                        {params[1] != "" ? (
                          <span className="text-gray-400 text-sm ml-2 mr-2">
                            /
                          </span>
                        ) : null}{" "}
                        <Link
                          key={param}
                          href={
                            id
                              ? `${params.slice(0, index + 1).join("/")}` +
                                "/" +
                                id
                              : `${params.slice(0, index + 1).join("/")}`
                          }
                        >
                          <a className="text-gray-400  hover:text-indigo-400 cursor-pointer ml-2 mr-2">
                            {prettyPrintSubject(
                              (param.charAt(0).toUpperCase() + param.slice(1))
                                .replace(/-/g, " ")
                                .replace(/%/g, " ")
                                .split("?")[0]
                            )}
                          </a>
                        </Link>
                      </div>
                    );
                  } else
                    return (
                      <div className="inline-block" key={index}>
                        <span className="text-gray-400 ml-2 mr-2 text-sm">
                          /
                        </span>
                        <Link
                          key={index}
                          href={`${params.slice(0, index + 1).join("/")}`}
                        >
                          <a className="text-gray-400  hover:text-indigo-500 cursor-pointer ml-2 mr-2">
                            {prettyPrintSubject(
                              (param.charAt(0).toUpperCase() + param.slice(1))
                                .replace(/-/g, " ")
                                .replace(/%/g, " ")
                                .split("?")[0]
                            )}
                          </a>
                        </Link>
                      </div>
                    );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Navbar;
