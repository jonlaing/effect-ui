import type { Element } from "./Element.js";

export interface Component<Name extends string, Props = object> {
  readonly _tag: Name;
  (props: Props): Element;
}

export const component = <Name extends string, Props = object>(
  name: Name,
  render: (props: Props) => Element,
): Component<Name, Props> => {
  const fn = (props: Props): Element => render(props);

  return Object.assign(fn, { _tag: name }) as Component<Name, Props>;
};
