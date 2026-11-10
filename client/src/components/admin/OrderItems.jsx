import { useState, useEffect } from "react";

const money = (value) => '$' + Number(value).toFixed(2);

//read-only list of what was bought in one order, shown on the admin order page
const OrderItems = ({ orderId }) => {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('Loading items...');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch(`/api/Orders/${orderId}/items`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setItems(data);
        setMessage(data.length === 0 ? 'This order has no items.' : '');
      } catch (error) {
        console.log(error);
        setMessage(error.message);
      }
    };
    loadItems();
  }, [orderId]);

  const total = items.reduce((sum, item) => sum + Number(item.LineTotal), 0);

  return (
    <div className="pt-8">
      <h2 className="text-xl underline pb-2">Items in this order</h2>
      {message && <p className="text-gray-500">{message}</p>}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-5 border-b font-bold">
            <span className="px-3 py-2">Item</span>
            <span className="px-3 py-2">Quantity</span>
            <span className="px-3 py-2">Price Paid</span>
            <span className="px-3 py-2">Regular Price</span>
            <span className="px-3 py-2">Line Total</span>
          </div>
          {items.map((item) => (
            <div key={item.ItemID} className="grid grid-cols-5 border-b">
              <span className="px-3 py-2.5">{item.Item}</span>
              <span className="px-3 py-2.5">{item.Quantity}</span>
              <span className="px-3 py-2.5">{money(item.PricePaid)}</span>
              <span className="px-3 py-2.5">{money(item.RegularPrice)}</span>
              <span className="px-3 py-2.5">{money(item.LineTotal)}</span>
            </div>
          ))}
          <p className="pt-2 text-sm text-gray-500">Items subtotal {money(total)} (before any discount code)</p>
        </>
      )}
    </div>
  );
};

export default OrderItems;
