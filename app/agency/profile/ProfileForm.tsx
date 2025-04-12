"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"
import { updateAgencyProfile } from "@/actions/agency/agencyActions"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { uploadImages } from "@/actions/uploadActions"

const profileSchema = z.object({
  name: z.string().min(1, "Agency name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
})

export type AgencyProfileFormValues = z.infer<typeof profileSchema>

interface AgencyProfileFormProps {
  initialData: any
}

export default function AgencyProfileForm({ initialData }: AgencyProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.logo || null)
  
  // Set default values from initial data
  const form = useForm<AgencyProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.agencyName || "",
      email: initialData?.contactEmail || "",
      phone: initialData?.contactPhone || "",
      address: initialData?.address || "",
      logo: initialData?.logo || "",
    },
  })

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      // Validate file type
      if (!file.type.includes("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Create FormData and append file
      const formData = new FormData();
      formData.append("file", file);
      
      // Upload the image
      const logoUrl = await uploadImages(formData);
      
      // Update form value and preview
      form.setValue("logo", logoUrl);
      setPreviewImage(logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: AgencyProfileFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Map form field names to agency schema field names
      const agencyData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo: data.logo,
      }
      
      // Call the server action to update the agency profile
      const result = await updateAgencyProfile(agencyData)
      
      if (result.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.error || "Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Upload Section */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agency Logo</FormLabel>
              <div className="flex items-center space-x-4">
                {previewImage ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <Image 
                      src={previewImage}
                      alt="Agency logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center border">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      'Choose File'
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 200x200 pixels
                  </p>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agency Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agency Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter agency name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
