"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
// import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { encryptText, decryptText } from "@/lib/encryption";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  location: z.string().optional(),
  weather: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  isEncrypted: z.boolean(),
  sentiment: z.number().min(-1).max(1).optional(),
  customFields: z.record(z.string()),
});

type JournalEntryFormProps = {
  entry?: any;
  encryptionKey: string;
};

export function JournalEntryForm({
  entry,
  encryptionKey,
}: JournalEntryFormProps) {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: entry || {
      isEncrypted: true,
      tags: [],
      customFields: {},
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [audioNote, setAudioNote] = useState<Blob | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, string>>(
    entry?.customFields || {}
  );
  //   const { toast } = useToast();
  const router = useRouter();

  const isEncrypted = watch("isEncrypted");

  useEffect(() => {
    if (entry && entry.isEncrypted) {
      setValue("content", decryptText(entry.content, encryptionKey));
    }
  }, [entry, encryptionKey, setValue]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(async ([key, value]) => {
        if (key === "content" && isEncrypted) {
          const encryptedContent = await encryptText(
            value as string,
            encryptionKey
          );
          formData.append(key, encryptedContent);
        } else if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "customFields") {
          formData.append(key, JSON.stringify(customFields));
        } else {
          formData.append(key, value as string);
        }
      });

      if (audioNote) {
        formData.append("audioNote", audioNote);
      }

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(
        entry ? `/api/journal/${entry.id}` : "/api/journal",
        {
          method: entry ? "PATCH" : "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save journal entry");
      }

      //   toast({
      //     title: entry ? "Journal entry updated" : "Journal entry created",
      //     description: "Your journal entry has been saved successfully.",
      //   });

      router.push("/journal");
    } catch (error) {
      console.error("Failed to save journal entry:", error);
      //   toast({
      //     title: "Error",
      //     description: "Failed to save journal entry. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioRecording = () => {
    // Implement audio recording logic here
  };

  const handleAttachmentUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setAttachments([...attachments, ...Array.from(event.target.files)]);
    }
  };

  const addCustomField = () => {
    const fieldName = prompt("Enter custom field name:");
    if (fieldName) {
      setCustomFields({ ...customFields, [fieldName]: "" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {entry ? "Edit Journal Entry" : "New Journal Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input {...register("title")} placeholder="Title" />
            <Textarea
              {...register("content")}
              placeholder="Write your journal entry here..."
              rows={10}
            />
            <Input {...register("mood")} placeholder="Mood" />
            <Input {...register("location")} placeholder="Location" />
            <Input {...register("weather")} placeholder="Weather" />
            <Select {...register("category")}>
              <option value="">Select a category</option>
              {/* Add category options here */}
            </Select>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  //   onChange={(selectedOptions: any[]) =>
                  //     field.onChange(
                  //       selectedOptions.map((option: { value: any }) => option.value)
                  //     )
                  //   }
                >
                  {/* Add tag options here */}
                </Select>
              )}
            />
            <div className="flex items-center space-x-2">
              <Switch {...register("isEncrypted")} id="encrypt" />
              <label htmlFor="encrypt">Encrypt this entry</label>
            </div>
            <div>
              <label>Sentiment</label>
              <Controller
                name="sentiment"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={-1}
                    max={1}
                    step={0.1}
                    value={[field.value || 0]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                )}
              />
            </div>
            <div>
              <Button type="button" onClick={handleAudioRecording}>
                Record Audio Note
              </Button>
            </div>
            <div>
              <Input type="file" multiple onChange={handleAttachmentUpload} />
            </div>
            <div>
              <Button type="button" onClick={addCustomField}>
                Add Custom Field
              </Button>
              {Object.entries(customFields).map(([fieldName, fieldValue]) => (
                <Input
                  key={fieldName}
                  placeholder={fieldName}
                  value={fieldValue}
                  onChange={(e) =>
                    setCustomFields({
                      ...customFields,
                      [fieldName]: e.target.value,
                    })
                  }
                />
              ))}
            </div>
          </div>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/journal")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {entry ? "Update" : "Create"} Entry
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
