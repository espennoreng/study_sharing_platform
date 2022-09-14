import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/nav/Footer";
import { AuthUserProvider } from "../firebase/AuthUserProvider";
import { createContext, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
// Import global styles

export const FileCtx = createContext({
  downloadFile: null as any,
  setDownloadFile: (t: any) => {},
  uploadOpen: false,
  setUploadOpen: (t: boolean) => {},
  userDownloadPoints: 0,
  setUserDownloadPoints: (t: number) => {},
  lastVisitedDoc: null as any,
  setLastVisitedDoc: (t: any) => {},
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [downloadFile, setDownloadFile] = useState<any>(null);
  const [userDownloadPoints, setUserDownloadPoints] = useState<number>(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lastVisitedDoc, setLastVisitedDoc] = useState<any>(null);
  const { pathname } = useRouter();

  return (
    <>
      <AuthUserProvider>
        <FileCtx.Provider
          value={{
            downloadFile,
            setDownloadFile,
            uploadOpen,
            setUploadOpen,
            userDownloadPoints,
            setUserDownloadPoints,
            lastVisitedDoc,
            setLastVisitedDoc,
          }}
        >
          <div className="bg-gray-100 h-full">
            <Navbar />
            <div className="mx-auto">
              <Component {...pageProps} />
            </div>
            {pathname.split("/")[1] !== "admin" ? <Footer /> : null}{" "}
          </div>
        </FileCtx.Provider>
      </AuthUserProvider>
    </>
  );
};

export default MyApp;
