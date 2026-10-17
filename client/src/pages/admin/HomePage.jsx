import { useSearchParams } from "react-router-dom";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity') ?? 'Employee';

  return (
    <section className='border-b border-r'>
      <div className='inline-flex p-10'>
        <h2 className='text-3xl pr-4 underline'>{entity}</h2>
        <button className="button-highlight p-1 border-2"> Add New </button>
      </div>
      <main className=''>
        
      </main>
    </section>
  )
}

export default HomePage
