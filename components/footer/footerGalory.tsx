import Image from "next/image"

export default function FooterGallery() {
  return (
    <div className="flex w-full flex-wrap">
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage1.jpg"} alt="" fill />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage2.jpg"} alt="" fill />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage3.jpg"} alt="" fill />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage4.jpg"} alt="" fill />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage5.jpg"} alt="" fill />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image src={"/footerImages/footerimage6.jpg"} alt="" fill />
      </div>
    </div>
  )
}
