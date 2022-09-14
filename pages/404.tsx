import Link from "next/link";

export default function FourOhFour() {
  return (
    <div className="container mx-auto p-4 text-center text-gray-800 h-screen mt-10">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-xl mb-4 mt-4">
        Vi fant desverre ikke siden du lette etter :( <br />
        Det er mulig vi har endret url eller siden har blitt slettet.
      </p>
      <Link href="/dokumenter">
        <a className="text-xl text-indigo-500 hover:text-indigo-700 ">
          Søk etter en annen side :))
        </a>
      </Link>
    </div>
  );
}
