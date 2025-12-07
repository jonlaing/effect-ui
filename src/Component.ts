import type { Element } from "./Element";

/**
 * A named component function that renders props to an Element.
 * @template Name - The component's tag name for identification
 * @template Props - The props type accepted by the component
 */
export interface Component<Name extends string, Props = object> {
  /** The component's identifying tag name */
  readonly _tag: Name;
  (props: Props): Element;
}

/**
 * Create a named component from a render function.
 * @param name - Unique name for the component (useful for debugging)
 * @param render - Function that renders props to an Element
 *
 * @example
 * ```ts
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
 */
export const component = <Name extends string, Props = object>(
  name: Name,
  render: (props: Props) => Element,
): Component<Name, Props> => {
  const fn = (props: Props): Element => render(props);

  return Object.assign(fn, { _tag: name }) as Component<Name, Props>;
};
