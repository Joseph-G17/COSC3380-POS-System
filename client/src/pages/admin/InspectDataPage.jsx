import { useParams } from "react-router-dom"
import InspectHeader from "../../components/admin/InspectHeader";
import InspectDescription from "../../components/admin/InspectDescription";
import InspectButtons from "../../components/admin/InspectButtons";

const InspectDataPage = () => {
  const {entity} = useParams();
  const {id} = useParams();

  return (
    <>
      <InspectHeader entity={entity} id={id} />
      <InspectDescription />
      <InspectButtons entity={entity} id={id} />
    </>
  )
}

export default InspectDataPage