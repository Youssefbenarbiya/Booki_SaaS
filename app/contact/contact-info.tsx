import { Instagram, MessageCircle, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactInfo() {
  return (
    <div className="bg-[#FFF7F1] rounded-2xl p-8 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">
          Contact Information
        </h2>
        <p className="text-muted-foreground mb-8">
          Say something to start a live chat!
        </p>

        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <span className="font-semibold">📞</span>
            </div>
            <p>+ 216 24 201 201</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <span className="font-semibold">✉️</span>
            </div>
            <p>booking@gmail.com</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <span className="font-semibold">📍</span>
            </div>
            <p>Nabeul, Tunisie</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-orange-500/10 hover:text-orange-500"
          >
            <Twitter className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-orange-500/10 hover:text-orange-500"
          >
            <Instagram className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-orange-500/10 hover:text-orange-500"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Decorative airplanes */}
      <div className="absolute bottom-8 right-8 opacity-20">
        <div className="relative w-32 h-32">
          <div className="absolute right-0 bottom-0 transform rotate-45">
            ✈️
          </div>
          <div className="absolute left-0 top-0 transform -rotate-45">✈️</div>
        </div>
      </div>
    </div>
  )
}
