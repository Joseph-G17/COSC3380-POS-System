import { useSearchParams } from "react-router-dom";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const entity = searchParams.get('entity') ?? 'Employee';
  const form = searchParams.get('form') ?? 'Manage Sales Form'

  return (
    <section className='border-b border-r'>
      <div className='inline-flex p-10'>
        <h2 className='admin-entity-header text-3xl pr-4 underline'>{entity}</h2>
        <h2 className='admin-form-header text-3xl pr-4 underline'>{form}</h2>
        <button className="button-highlight p-1 border-2"> Add New </button>
      </div>
      <main className=''>
        
      </main>
    </section>
  )
}

export default HomePage
