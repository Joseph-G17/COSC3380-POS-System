const ClockInPage = () => {
  const TIME = "1:00";
  return (
    <section className="text-center w-1/2 h-180 border self-center justify-self-center">
      <div className="grid grid-rows-[100px_auto_100px] gap-4">
        <div className="relative justify-items-center">
          <h1 className="text-xl absolute">Clock In</h1>
          <h2 className="text-6xl absolute bottom-0">{TIME}</h2>
        </div>
        <p>TIME CLOCK INFORMATION!</p>
        <div className="">
          <button>CLOCK IN</button>
          <button>CLOCK OUT</button>
        </div>
      </div>
    </section>
  )
}

export default ClockInPage