import { useSearchParams } from 'react-router-dom';

const CashierCheckout = () => {
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity') ?? 'Employee';

  return (
    <section className='border-b border-r'>
      <div className='inline-flex p-10'>
        <h1 className='text-3xl pr-4 underline'>{entity}</h1>
        <button className="p-1 border-2"> Add New </button>
        <button className="p-1 border-2"> Checkout </button>
      </div>
      <main className=''>
        
      </main>
    </section>
  )
}

export default CashierCheckout