import TitleHeader from "../../components/admin/TitleHeader"
import DataSnippets from "../../components/admin/DataSnippets"
import { useParams } from "react-router-dom";

const ID_FIELDS = {
    Employees: 'EmployeeID',
    Orders: 'OrderID',
    Items: 'ItemID',
    Discounts: 'DiscountID',
    Sales: 'SaleID',
    Departments: 'DepartmentID',
    Returns: 'ReturnID'
  };

const HomePage = () => {
  const {entity} = useParams();
  const idField = ID_FIELDS[entity];


  return (
    <section className='border-b border-r'>
      <TitleHeader title={entity} showAdd/>
      <DataSnippets entity={entity} idField={idField}/>
    </section>
  )
}

export default HomePage
