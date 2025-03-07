import Image from "next/image"

export default function TopDestinations() {
  return (
    <section className="flex flex-col items-center">
      
      <h1 className="-translate-y-10 text-5xl font-semibold tracking-widest">
       Top Destination
      </h1>
      <h6 className="text-lg text-muted-foreground">
        The most popular options among travelers living in Tunisia
      </h6>
      <div className="my-16 flex h-fit w-4/5 flex-col gap-6 px-8 lg:h-[550px] lg:w-full lg:flex-row xl:px-48">
        <div className="h-full w-full flex-[2] rounded-xl">
          <Image
            src="/assets/destination1.jpg"
            alt="Destination 1"
            width={400}
            height={400}
            className="h-[400px] w-full rounded-xl lg:h-full"
          />
        </div>
        <div className="flex h-full w-full flex-[1] flex-wrap items-center justify-center gap-6">
          <Image
            src="/assets/destination2.jpg"
            alt="Destination 2"
            width={400}
            height={400}
            className="h-[400px] w-full max-w-[100%] rounded-xl lg:h-[47%]"
          />
          <Image
            src="/assets/destination3.jpg"
            alt="Destination 3"
            width={400}
            height={400}
            className="h-[400px] w-full max-w-[100%] rounded-xl lg:h-[47%]"
          />
        </div>
        <div className="h-full w-full flex-[1] rounded-xl">
          <Image
            src="/assets/destination4.png"
            alt="Destination 4"
            width={400}
            height={400}
            className="h-[400px] w-full rounded-xl lg:h-full"
          />
        </div>
      </div>
    </section>
  )
}
