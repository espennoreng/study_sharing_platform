import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const UploadProgress = ({ active }: any) => {
  return (
    <div className="w-full md:pl-16 md:pr-16">
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center items-center">
          <span
            className={
              active == 1
                ? "text-indigo-500 text-lg md:text-xl font-semibold"
                : "text-indigo-500 text-lg md:text-lg"
            }
          >
            Last opp
          </span>
        </div>
        <div className="flex flex-col justify-center items-center">
          <ArrowForwardIosIcon className="text-indigo-500 text-sm" />
        </div>
        <div className="flex flex-col justify-center items-center">
          {active > 1 ? (
            <span
              className={
                active == 2
                  ? "text-indigo-500 text-lg md:text-xl font-semibold"
                  : "text-indigo-500 text-lg md:text-lg"
              }
            >
              Verifikasjon
            </span>
          ) : (
            <span className="text-gray-300 text-lg md:text-xl">
              Verifikasjon
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center items-center">
          {active > 1 ? (
            <ArrowForwardIosIcon className="text-indigo-500 text-sm" />
          ) : (
            <ArrowForwardIosIcon className="text-gray-300 text-sm" />
          )}
        </div>
        <div className="flex flex-col justify-center items-center">
          {active > 2 ? (
            <span
              className={
                active == 3
                  ? "text-indigo-500 text-lg md:text-xl font-semibold"
                  : "text-indigo-500 text-lg md:text-lg"
              }
            >
              Last ned
            </span>
          ) : (
            <span className="text-gray-300 text-lg md:text-xl">Last ned</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;
