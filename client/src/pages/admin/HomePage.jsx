import { useState } from 'react';
import TitleHeader from "../../components/admin/TitleHeader"
import DataSnippets from "../../components/admin/DataSnippets"
import { useParams } from "react-router-dom";

const ID_FIELDS = {
    Employees: 'EmployeeID',
    Orders: 'OrderID',
    Items: 'ItemID',
    'Item Categories': 'ItemCategoryID',
    Discounts: 'DiscountID',
    Sales: 'SaleID',
    Departments: 'DepartmentID',
    Returns: 'ReturnID',
    Inventory: 'InventoryID',
    Customers: 'CustomerID',
    Shipments: 'ShipmentID',
    Seasons: 'SeasonID',
    //two-column keys, the link id becomes "SaleID-ItemID"
    'Sale Items': ['SaleID', 'ItemID'],
    'Seasonal Deals': ['SeasonID', 'ItemID']
  };

const HomePage = () => {
  const {entity} = useParams();
  const {report} = useParams();
  const idField = ID_FIELDS[entity];
  const [refresh, setRefresh] = useState(0);

  return (
    <section className='border-b border-r'>
      <TitleHeader entity={entity} report={report} showAdd onCreated={() => setRefresh(refresh + 1)}/>
      <DataSnippets entity={entity} idField={idField} refresh={refresh}/>
    </section>
  )
}

export default HomePage
