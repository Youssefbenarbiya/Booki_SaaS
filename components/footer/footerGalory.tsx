import Image from "next/image"

export default function FooterGallery() {
  return (
    <div className="flex w-full flex-wrap">
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage1.jpg"}
          alt="Footer image 1"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage2.jpg"}
          alt="Footer image 2"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage3.jpg"}
          alt="Footer image 3"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage4.jpg"}
          alt="Footer image 4"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage5.jpg"}
          alt="Footer image 5"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src={"/footerImages/footerimage6.jpg"}
          alt="Footer image 6"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </div>
  )
}
