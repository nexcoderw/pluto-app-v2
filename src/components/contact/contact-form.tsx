"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  LoaderCircle,
  Mail,
  MessageSquare,
  Send,
  Tag,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContactMessage } from "@/services/api/contact-messages";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./contact-form.module.css";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().min(3, "Tell us what this is about.").max(160),
  message: z.string().trim().min(10, "Add a little more detail.").max(5000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
    mode: "onBlur",
  });
  const mutation = useMutation({
    mutationFn: createContactMessage,
    onSuccess: (response) => {
      toast.success("Message sent.", { description: response.message });
      form.reset();
    },
    onError: (error) => {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Your message could not be sent. Please try again.";
      form.setError("root", { message });
      toast.error("Message not sent.", { description: message });
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div className={styles.formHeading}>
        <div>
          <MessageSquare aria-hidden="true" />
        </div>
        <span>
          <strong>Send us a message</strong>
          <small>We’ll reply by email.</small>
        </span>
      </div>
      <div className={styles.grid}>
        <Field
          id="contact-name"
          label="Your name"
          error={form.formState.errors.name?.message}
        >
          <Input
            id="contact-name"
            icon={<UserRound />}
            autoComplete="name"
            placeholder="Aline Uwase"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
        </Field>
        <Field
          id="contact-email"
          label="Email address"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="contact-email"
            icon={<Mail />}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
        </Field>
      </div>
      <Field
        id="contact-subject"
        label="Subject"
        error={form.formState.errors.subject?.message}
      >
        <Input
          id="contact-subject"
          icon={<Tag />}
          placeholder="How can we help?"
          aria-invalid={!!form.formState.errors.subject}
          {...form.register("subject")}
        />
      </Field>
      <Field
        id="contact-message"
        label="Message"
        error={form.formState.errors.message?.message}
      >
        <div
          className={styles.messageShell}
          data-invalid={!!form.formState.errors.message}
        >
          <MessageSquare aria-hidden="true" />
          <Textarea
            id="contact-message"
            rows={5}
            placeholder="Share the details that will help us understand your request…"
            aria-invalid={!!form.formState.errors.message}
            {...form.register("message")}
          />
        </div>
      </Field>
      {form.formState.errors.root?.message ? (
        <p className={styles.rootError} role="alert">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div className={styles.footer}>
        <p>Please don’t include passwords or payment card details.</p>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className={styles.submit}
        >
          {mutation.isPending ? (
            <LoaderCircle
              className={styles.spinner}
              aria-label="Sending message"
            />
          ) : (
            <>
              <Send data-icon="inline-start" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
