import { Effect, Schema } from "effect";
import {
  $,
  component,
  Link,
  Form,
  each,
  RouterContext,
  when,
  t,
  Route,
} from "@effex/platform";

const ContactSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Name is required" }),
  ),
  email: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Email is required" }),
  ),
  message: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Message is required" }),
  ),
});

// Action response type
interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export const route = Route.define({
  action: ({ formData }) =>
    Effect.gen(function* () {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      if (!name || !email || !message) {
        return {
          success: false,
          message: "Please fill in all fields",
          errors: {
            ...(name ? {} : { name: ["Name is required"] }),
            ...(email ? {} : { email: ["Email is required"] }),
            ...(message ? {} : { message: ["Message is required"] }),
          },
        };
      }

      yield* Effect.sleep(500);
      console.log(`Contact form submitted: ${name} <${email}>`);

      return {
        success: true,
        message: `Thanks ${name}! We'll get back to you soon.`,
      };
    }),
});

// Page component
const ContactPage = component("ContactPage", () =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    const form = yield* Form.make({
      schema: ContactSchema,
      initial: { name: "", email: "", message: "" },
      action: true,
    });

    // Derive success message from action state
    const actionData = router.actionState.map(
      (state) => state.data as ActionResponse | null,
    );
    const successMessage = actionData.map((data) =>
      data?.success ? data.message : null,
    );
    const isSubmitting = router.actionState.map((state) => state.isSubmitting);

    // Helper to handle form submission - must return Effect for event handler
    const handleSubmit = (e: SubmitEvent) =>
      Effect.gen(function* () {
        e.preventDefault();
        yield* form.submit();
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => console.error("Form submit error:", error)),
        ),
      );

    return yield* $.div({ class: "page" }, [
      $.h1({}, ["Contact Us"]),
      $.p({}, ["Fill out the form below to get in touch."]),

      // Show success message when action succeeds
      when(
        successMessage.map((s) => !!s),
        {
          onTrue: () =>
            $.div(
              {
                class: "success",
                style: {
                  padding: "1rem",
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                },
              },
              t`${successMessage}`,
            ),
          onFalse: () => $.span(),
        },
      ),

      $.form({ class: "card", onSubmit: handleSubmit }, [
        // Name field
        $.div({ class: "field" }, [
          $.label({ for: "name" }, ["Name"]),
          $.input({
            id: "name",
            name: "name",
            type: "text",
            value: form.fields.name.value,
            onInput: (e) =>
              form.fields.name.value.set((e.target as HTMLInputElement).value),
            onBlur: () => form.fields.name.touch(),
          }),
          // Show errors
          each(form.fields.name.errors, {
            key: (err) => err,
            render: (err) =>
              $.span(
                {
                  class: "error",
                  style: { color: "red", fontSize: "0.875rem" },
                },
                [err],
              ),
          }),
        ]),

        // Email field
        $.div({ class: "field" }, [
          $.label({ for: "email" }, ["Email"]),
          $.input({
            id: "email",
            name: "email",
            type: "email",
            value: form.fields.email.value,
            onInput: (e) =>
              form.fields.email.value.set((e.target as HTMLInputElement).value),
            onBlur: () => form.fields.email.touch(),
          }),
          each(form.fields.email.errors, {
            key: (err) => err,
            render: (err) =>
              $.span(
                {
                  class: "error",
                  style: { color: "red", fontSize: "0.875rem" },
                },
                [err],
              ),
          }),
        ]),

        // Message field
        $.div({ class: "field" }, [
          $.label({ for: "message" }, ["Message"]),
          $.textarea({
            id: "message",
            name: "message",
            rows: 4,
            value: form.fields.message.value,
            onInput: (e) =>
              form.fields.message.value.set(
                (e.target as HTMLTextAreaElement).value,
              ),
            onBlur: () => form.fields.message.touch(),
          }),
          each(form.fields.message.errors, {
            key: (err) => err,
            render: (err) =>
              $.span(
                {
                  class: "error",
                  style: { color: "red", fontSize: "0.875rem" },
                },
                [err],
              ),
          }),
        ]),

        // Submit button with loading state
        $.div({ class: "actions" }, [
          $.button(
            {
              type: "submit",
              disabled: isSubmitting,
            },
            [isSubmitting.map((s) => (s ? "Sending..." : "Send Message"))],
          ),
        ]),
      ]),

      $.div({ class: "card" }, $.p({}, Link({ href: "/" }, "Back to Home"))),
    ]);
  }),
);

export default ContactPage;
