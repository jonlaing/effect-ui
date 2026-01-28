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
}

/**
 * Context tag for animation configuration.
 * Optional - control flows work without it, just without animations.
 */
export class AnimationConfigCtx extends Context.Tag(
  "@effex/dom/AnimationConfigCtx",
)<AnimationConfigCtx, AnimationConfig>() {}
