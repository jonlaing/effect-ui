import type { Element } from "./Element";
import type { Child } from "./Element/types";

/**
 * Valid children types for a component.
 */
export type Children<E = never, R = never> =
  | Child<E, R>
  | readonly Child<E, R>[];

/**
 * Helper type to check if Props is empty (equivalent to {} or object)
 */
type IsEmptyProps<Props> = keyof Props extends never ? true : false;

/**
 * A named component function that renders props to an Element.
 * Supports multiple call signatures similar to element factories.
 * Props can be omitted when the component has no required props.
 *
 * @template Name - The component's tag name for identification
 * @template Props - The props type accepted by the component
 * @template E - The error type that can be produced by the component
 * @template R - The requirements/context type needed by the component
 *
 * @example
 * ```ts
 * // Component with no props - can omit the argument
 * const Header = component("Header", () => $.h1("Welcome"))
 * Header()  // No props needed
 *
 * // Props with children as second argument
 * Link({ href: "/" }, "Home")
 * Link({ href: "/about", class: "nav-link" }, ["About Us"])
 * ```
 *
 * Note: Error and requirement types from children are inferred at the call site
 * and combined with the component's own types in the return type.
 */
export type Component<
  Name extends string,
  Props = object,
  E = never,
  R = never,
> = {
  /** The component's identifying tag name */
  readonly _tag: Name;
} & (IsEmptyProps<Props> extends true
  ? {
      // () - no props needed
      (): Element<E, R>;
      // (children) - just children
      <CE = never, CR = never>(
        children: Children<CE, CR>,
      ): Element<E | CE, R | CR>;
      // (props) - explicit empty props
      (props: Props): Element<E, R>;
      // (props, children)
      <CE = never, CR = never>(
        props: Props,
        children: Children<CE, CR>,
      ): Element<E | CE, R | CR>;
    }
  : {
      // (props) - props required
      (props: Props): Element<E, R>;
      // (props, children)
      <CE = never, CR = never>(
        props: Props,
        children: Children<CE, CR>,
      ): Element<E | CE, R | CR>;
    });

/**
 * Create a named component from a render function.
 * The render function receives props and optional children as separate arguments.
 *
 * @param name - Unique name for the component (useful for debugging)
 * @param render - Function that renders props and children to an Element
 *
 * @example
 * ```ts
 * // Simple component without children
 * interface ButtonProps {
 *   label: string
 *   onClick: () => void
 * }
 *
 * const Button = component("Button", (props: ButtonProps) =>
 *   button({ onClick: props.onClick }, [props.label])
 * )
 *
 * // Usage
 * Button({ label: "Click me", onClick: () => console.log("clicked") })
 * ```
 *
 * @example
 * ```ts
 * // Component with children as second argument
 * interface LinkProps {
 *   href: string
 *   class?: string
 * }
 *
 * const Link = component("Link", (props: LinkProps, children) =>
 *   a({ href: props.href, class: props.class }, children ?? [])
 * )
 *
 * // Usage - children as second argument
 * Link({ href: "/" }, "Home")
 * Link({ href: "/about", class: "nav-link" }, ["About", " Us"])
 * ```
 *
 * @example
 * ```ts
 * // Component with context requirements
 * const NavLink = component("NavLink", (props: { href: string }, children) =>
 *   Effect.gen(function* () {
 *     const router = yield* RouterContext
 *     return yield* button({ onClick: () => router.push(props.href) }, children ?? [])
 *   })
 * )
 * // Type: Component<"NavLink", { href: string }, never, RouterContext>
 * ```
 */
export const component = <
  Name extends string,
  Props = object,
  E = never,
  R = never,
>(
  name: Name,
  render: (props: Props, children?: Children<never, never>) => Element<E, R>,
): Component<Name, Props, E, R> => {
  const fn = (...args: unknown[]): Element<E, R> => {
    // No arguments - call with empty props
    if (args.length === 0) {
      return render({} as Props, undefined);
    }

    // Single argument - could be props or children
    if (args.length === 1) {
      const arg = args[0];
      // If it's a string, number, array, or Element, treat as children
      if (
        typeof arg === "string" ||
        typeof arg === "number" ||
        Array.isArray(arg)
      ) {
        return render({} as Props, arg as Children<never, never>);
      }
      // Otherwise treat as props
      return render(arg as Props, undefined);
    }

    // Two arguments - props and children
    return render(args[0] as Props, args[1] as Children<never, never>);
  };

  return Object.assign(fn, { _tag: name }) as Component<Name, Props, E, R>;
};
