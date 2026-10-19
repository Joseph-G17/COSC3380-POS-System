const LoginLayout = () => {
  return (
    <div className="mt-7">
      <div className="inline-flex justify-center items-center w-screen">
        <img src="/SaveSolLogo.png" alt="logo" className='w-30 h-30'/>
        <h1 className="text-6xl font-extralight">SaveSo</h1>
      </div>
      <form action="submit" className="justify-self-center mt-14 w-110">
        <div className="mb-14">
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="" className="text-3xl">Email: </label>
            <input required className='input-bar p-3' type="email" />
          </p>
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="" className="text-3xl">Password: </label>
            <input required className='input-bar p-3' type="password" />
          </p>
        </div>
        <div className="flex justify-between">
          <button className="rounded button-highlight p-2 text-2xl font-light border" 
            type="submit">
              Submit
          </button>
          <button className="rounded button-highlight  p-2 text-2xl font-light border"
            type="button" onClick={() => window.location.reload()}>
              Cancel 
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginLayout