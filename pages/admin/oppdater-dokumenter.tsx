import EditDocument from "../../components/admin/EditDocument";
import useFirebaseAuth from "../../firebase/useFirebaseAuth";

const UpdateDocument = () => {
  const { authUser } = useFirebaseAuth();
  return (
    <>
      {authUser && authUser.uid == "xJU4QWrF9KSD5wJERKTsVKkclAA2" ? (
        <EditDocument />
      ) : null}
    </>
  );
};
export default UpdateDocument;
