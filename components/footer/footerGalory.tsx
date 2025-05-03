import Image from "next/image"

export default function FooterGallery() {
  return (
    <div className="flex w-full flex-wrap">
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage1.jpg"
          alt="Footer image 1"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage2.jpg"
          alt="Footer image 2"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage3.jpg"
          alt="Footer image 3"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage4.jpg"
          alt="Footer image 4"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage5.jpg"
          alt="Footer image 5"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="relative h-[300px] min-w-[150px] flex-[1]">
        <Image
          src="/footerImages/footerimage6.jpg"
          alt="Footer image 6"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}
