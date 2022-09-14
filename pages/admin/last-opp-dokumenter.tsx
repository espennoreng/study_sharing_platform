import MassUpload from "../../components/uploads/MassUpload";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";

const UploadDocuments = () => {
  const { authUser } = useFirebaseAuth();
  return (
    <div className="h-screen mt-10 mb-20">
      {authUser && authUser.uid == "xJU4QWrF9KSD5wJERKTsVKkclAA2" ? (
        <MassUpload />
      ) : null}
    </div>
  );
};
export default UploadDocuments;
