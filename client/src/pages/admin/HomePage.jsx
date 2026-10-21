import TitleHeader from "../../components/admin/TitleHeader"
import DataSnippets from "../../components/admin/DataSnippets"
import { useParams } from "react-router-dom";

const HomePage = () => {
  const entities = ['Employee', 'Orders', 'Items', 'Discounts', 'Sales', 'Department', 'Returns'];

  const {entity} = useParams();


  return (
    <section className='border-b border-r'>
      <TitleHeader title={entity} showAdd/>
      <DataSnippets entity={entity}/>
    </section>
  )
}

export default HomePage
