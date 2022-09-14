import { Button, Card } from "@mui/material";
import { Box } from "@mui/system";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { getSubjects, getTypes, uploadFile } from "./UploadFunctions";

const MassUpload = () => {
  const [files, setFiles] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadTried, setUploadTried] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  // if something wrong check the different get types and subjects
  useEffect(() => {
    getTypes(setTypeOptions);
    getSubjects(setSubjectOptions);
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
  }, [, uploadTried]);

  // Todo: make it work

  return (
    <Card sx={{ mb: 2 }}>
      <Box p={5}>
        <FileUploader
          multiple
          handleChange={(e: any) => {
            setFiles(e);
          }}
        />
        <Box>
          {files !== null ? files.length + " filer valgt" : "Ingen filer valgt"}
        </Box>
        <Button
          onClick={() => {
            userId
              ? uploadFile(
                  files,
                  userId,
                  setUploadTried,
                  typeOptions,
                  subjectOptions,
                  undefined,
                  "Godkjent",
                  undefined,
                  undefined,
                  undefined,
                  true
                )
              : alert("Du må være logget inn for å laste opp filer");
          }}
        >
          {" "}
          Last opp alle{" "}
        </Button>
      </Box>
    </Card>
  );
};

export default MassUpload;
