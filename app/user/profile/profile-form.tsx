"use client"

import { Loader2 } from "lucide-react"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Session } from "@/lib/auth/type"
import { updateUserInfoSchema } from "@/lib/zod"
import { authClient } from "@/auth-client"

// Define the UserFormType based on the schema
type UserFormType = z.infer<typeof updateUserInfoSchema>

export function UpdateUserInfo({ session }: { session: Session }) {
  const { user } = session
  const { toast } = useToast()
  const form = useForm<UserFormType>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      name: user.name || "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(values: UserFormType) {
    try {
      await authClient.updateUser(values)
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error!",
        description: `${error}`,
      })
    }
  }

  return (
    <div>
      <div className="text-lg">Update Info</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isSubmitting ? (
            <Button type="submit">Change</Button>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </form>
      </Form>
    </div>
  )
}
