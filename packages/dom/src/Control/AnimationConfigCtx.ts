/**
 * Context for animation configuration.
 *
 * Provided by DOM control flow functions (when, match, each) and read by
 * ClientControlCtx to apply enter/exit animations.
 */

import { Context } from "effect";

import type {
  AnimationOptions,
  ListAnimationOptions,
} from "../Animation/index.js";

/**
 * Animation configuration that can be provided to control flow components.
 */
export interface AnimationConfig {
  /** Animation options for single-slot controls (when, match) */
  readonly single?: AnimationOptions;
  /** Animation options for list controls (each) */
  readonly list?: ListAnimationOptions;
  /**
   * When true, animations also fire during hydration for slots whose DOM
   * pre-existed from SSR/SSG. Default behaviour is to attach handlers to
   * pre-rendered DOM without re-animating (right choice for content lists);
   * setting `intro: true` opts a control into re-animation for decorative
   * intro sequences (staggered headline letters, opening scenes, ...).
   */
  readonly intro?: boolean;
}

/**
 * Context tag for animation configuration.
 * Optional - control flows work without it, just without animations.
 */
export class AnimationConfigCtx extends Context.Tag(
  "@stax-ui/dom/AnimationConfigCtx",
)<AnimationConfigCtx, AnimationConfig>() {}
