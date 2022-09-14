import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  docco,
  a11yLight,
  a11yDark,
  githubGist,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface Props {
  fileTexts: any;
}

const CodeDocument = ({ fileTexts }: Props) => {
  const [num, setNum] = useState(0);

  return (
    <div className="max-w-7xl my-8 m-auto h-full">
      <div className="bg-gray-100 w-full mx-auto pb-1 md:pb-4 md:pl-0">
        <div className="min-h-full bg-white p-4 drop-shadow rounded ">
          <div className="">
            <div className="border-b-2 border-b-gray-200 mb-4">
              <div className="pb-2 pt-0">
                <p className="text-indigo-500 pb-2 text-sm">Utdrag</p>
              </div>
            </div>
            <div className="overflow-hidden w-full">
              <ul className="pb-2 pt-0 flex flex-wrap cursor-pointer gap-2 ">
                {fileTexts.length > 0
                  ? fileTexts.map((file: any, index: any) => {
                      return (
                        <li
                          key={index}
                          onClick={() => {
                            setNum(index);
                          }}
                          className={`p-2 pl-4 pr-4 rounded hover:text-gray-600 hover:bg-gray-200  ${
                            num == index
                              ? "text-gray-600 bg-gray-200"
                              : "text-gray-500 bg-gray-50"
                          }`}
                        >
                          {file.fileName}
                        </li>
                      );
                    })
                  : null}
              </ul>
            </div>
          </div>

          <div className="pb-2 pt-0 rounded">
            {fileTexts.length > 0 ? (
              <SyntaxHighlighter
                language={
                  fileTexts > 0 ? fileTexts[num].fileName.split(".")[1] : null
                }
                style={a11yDark}
                showLineNumbers
                customStyle={{
                  fontSize: "14px",
                  fontFamily: "Fira Code",
                  borderRadius: "5px",
                  backgroundColor: "dark",
                  padding: "15px",
                }}
              >
                {fileTexts[num].content.substring(0, 1000) + "..."}
              </SyntaxHighlighter>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDocument;
