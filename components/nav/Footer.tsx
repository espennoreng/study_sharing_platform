const Footer = () => {
  return (
    <footer className=" w-full aspect-ratio-1 p-4 bg-white  shadow md:px-6 md:py-8   ">
      <div className="max-w-7xl mx-auto">
        <div className=" sm:flex sm:items-center sm:justify-between ">
          <a
            key={"Hjem"}
            href={"/"}
            className="self-center text-2xl font-semibold whitespace-nowrap text-indigo-500"
          >
            Finnfasit.no
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 ">
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6 ">
                Kontakt oss
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Personvern
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6 ">
                Vilkår for bruk
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-100 sm:mx-auto  lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center ">
          © 2022{" "}
          <a href={"/"} className="hover:underline">
            Finnfasit.no
          </a>
          . Alle rettigheter reservert.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
