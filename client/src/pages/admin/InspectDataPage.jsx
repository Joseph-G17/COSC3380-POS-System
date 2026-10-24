import { useParams } from "react-router-dom"
import InspectHeader from "../../components/admin/InspectHeader";
import InspectDescription from "../../components/admin/InspectDescription";
import InspectButtons from "../../components/admin/InspectButtons";

const InspectDataPage = () => {
  const {entity} = useParams();
  const {id} = useParams();

  return (
    <section className="inline-flex">
      <InspectHeader entity={entity} />
      <InspectDescription entity={entity} id={id}/>
      <InspectButtons />
    </section>
  )
}

export default InspectDataPage