import { Input, Output } from "midi";
import React from "react";
import Reconciler, {
  Fiber,
  HostConfig,
  Lane,
  OpaqueHandle,
} from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import { RGB } from "../functions/colors";
import { createLogger } from "../logger";
import { GridController } from "../services/GridController";
import { getMini, LaunchpadMiniMK3 } from "../services/LaunchpadMiniMK3";
import { Effect, StateStore } from "../services/StateStore";

export function render(
  container: Container,
  component: React.ReactElement<any, any>
): undefined {
  const reconciler = Reconciler(config);
  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    "grid-controller",
    (error: Error) => {
      console.error("unrecoverable error", error);
    },
    null
  );
  reconciler.updateContainer(component, root, null);
  return undefined;
}

export async function waitForGridController(): Promise<Container> {
  try {
    const grid = getMini();
    const gridController: GridController = new LaunchpadMiniMK3(
      grid.input,
      grid.output
    );

    const screen: StateStore = StateStore({
      gridController: gridController,
    });
    return { gridController, grid, screen };
  } catch (er) {
    await new Promise((r) => setTimeout(r, 500));
    console.error("still waiting for grid", er);
    return await waitForGridController();
  }
}

type Type = "grid-key";
type Props = { position: number; color: RGB };
export type Container = {
  gridController: GridController;
  grid: {
    input: Input;
    output: Output;
  };
  screen: StateStore;
};
type Instance = Effect;
type TextInstance = unknown;
type SuspenseInstance = unknown;
type HydratableInstance = unknown;
type PublicInstance = unknown;
type HostContext = unknown;
type UpdatePayload = unknown;
type ChildSet = unknown;
type TimeoutHandle = ReturnType<typeof setTimeout>;
type NoTimeout = -1;

const log = createLogger("midirender");
function debug(s: string, attributes?: any) {
  log.silly(s, attributes);
}

const config: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  // -------------------
  //        Modes
  // -------------------
  // tslint:disable:max-line-length
  /**
   *
   * The reconciler has two modes: mutation mode and persistent mode. You must specify one of them.
   *
   * If your target platform is similar to the DOM and has methods similar to `appendChild`, `removeChild`, and so on, you'll want to use the **mutation mode**. This is the same mode used by React DOM, React ART, and the classic React Native renderer.
   *
   * ```js
   * const HostConfig = {
   *   // ...
   *   supportsMutation: true,
   *   // ...
   * }
   * ```
   *
   * Depending on the mode, the reconciler will call different methods on your host config.
   *
   * If you're not sure which one you want, you likely need the mutation mode.
   */
  // tslint:enable:max-line-length
  supportsMutation: true,

  // tslint:disable:max-line-length
  /**
   *
   * The reconciler has two modes: mutation mode and persistent mode. You must specify one of them.
   *
   * If your target platform has immutable trees, you'll want the **persistent mode** instead. In that mode, existing nodes are never mutated, and instead every change clones the parent tree and then replaces the whole parent tree at the root. This is the node used by the new React Native renderer, codenamed "Fabric".
   *
   * ```js
   * const HostConfig = {
   *   // ...
   *   supportsPersistence: true,
   *   // ...
   * }
   * ```
   *
   * Depending on the mode, the reconciler will call different methods on your host config.
   *
   * If you're not sure which one you want, you likely need the mutation mode.
   */
  // tslint:enable:max-line-length
  supportsPersistence: false,

  // -------------------
  //    Core Methods
  // -------------------

  // tslint:disable:max-line-length
  /**
   * This method should return a newly created node. For example, the DOM renderer would call `document.createElement(type)` here and then set the properties from `props`.
   *
   * You can use `rootContainer` to access the root container associated with that tree. For example, in the DOM renderer, this is useful to get the correct `document` reference that the root belongs to.
   *
   * The `hostContext` parameter lets you keep track of some information about your current place in the tree. To learn more about it, see `getChildHostContext` below.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its internal fields, be aware that it may change significantly between versions. You're taking on additional maintenance risk by reading from it, and giving up all guarantees if you write something to it.
   *
   * This method happens **in the render phase**. It can (and usually should) mutate the node it has just created before returning it, but it must not modify any other nodes. It must not register any event handlers on the parent tree. This is because an instance being created doesn't guarantee it would be placed in the tree — it could be left unused and later collected by GC. If you need to do something when an instance is definitely in the tree, look at `commitMount` instead.
   */
  // tslint:enable:max-line-length
  createInstance(
    type: Type,
    props: Props,
    rootContainer: Container,
    hostContext: HostContext,
    internalHandle
  ): Instance {
    debug("createInstance");
    return rootContainer.screen.createEffect(
      new Map([[props.position, props.color]])
    );
  },

  // tslint:disable:max-line-length
  /**
   * Same as `createInstance`, but for text nodes. If your renderer doesn't support text nodes, you can throw here.
   */
  // tslint:enable:max-line-length
  createTextInstance(
    text: string,
    rootContainer: Container,
    hostContext: HostContext,
    internalHandle
  ): TextInstance {
    debug("createTextInstance");
    return undefined;
  },

  // tslint:disable:max-line-length
  /**
   * This method should mutate the `parentInstance` and add the child to its list of children. For example, in the DOM this would translate to a `parentInstance.appendChild(child)` call.
   *
   * This method happens **in the render phase**. It can mutate `parentInstance` and `child`, but it must not modify any other nodes. It's called while the tree is still being built up and not connected to the actual tree on the screen.
   */
  // tslint:enable:max-line-length
  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance
  ): void {
    debug("appendInitialChild");
  },

  // tslint:disable:max-line-length
  /**
   * In this method, you can perform some final mutations on the `instance`. Unlike with `createInstance`, by the time `finalizeInitialChildren` is called, all the initial children have already been added to the `instance`, but the instance itself has not yet been connected to the tree on the screen.
   *
   * This method happens **in the render phase**. It can mutate `instance`, but it must not modify any other nodes. It's called while the tree is still being built up and not connected to the actual tree on the screen.
   *
   * There is a second purpose to this method. It lets you specify whether there is some work that needs to happen when the node is connected to the tree on the screen. If you return `true`, the instance will receive a `commitMount` call later. See its documentation below.
   *
   * If you don't want to do anything here, you should return `false`.
   */
  // tslint:enable:max-line-length
  finalizeInitialChildren(
    instance: Instance,
    type: Type,
    props: Props,
    rootContainer: Container,
    hostContext: HostContext
  ): boolean {
    debug("finalizeInitialChildren");
    return false;
  },

  // tslint:disable:max-line-length
  /**
   * React calls this method so that you can compare the previous and the next props, and decide whether you need to update the underlying instance or not. If you don't need to update it, return `null`. If you need to update it, you can return an arbitrary object representing the changes that need to happen. Then in `commitUpdate` you would need to apply those changes to the instance.
   *
   * This method happens **in the render phase**. It should only *calculate* the update — but not apply it! For example, the DOM renderer returns an array that looks like `[prop1, value1, prop2, value2, ...]` for all props that have actually changed. And only in `commitUpdate` it applies those changes. You should calculate as much as you can in `prepareUpdate` so that `commitUpdate` can be very fast and straightforward.
   *
   * See the meaning of `rootContainer` and `hostContext` in the `createInstance` documentation.
   */
  // tslint:enable:max-line-length
  prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
    rootContainer: Container,
    hostContext: HostContext
  ): UpdatePayload | null {
    debug("prepareUpdate");
    const update = new Map([
      [oldProps.position, null],
      [newProps.position, newProps.color],
    ]);
    if (oldProps.position !== newProps.position || oldProps.color)
      rootContainer.screen.updateEffect(instance.id, update);
    return null;
  },

  // tslint:disable:max-line-length
  /**
   * Some target platforms support setting an instance's text content without manually creating a text node. For example, in the DOM, you can set `node.textContent` instead of creating a text node and appending it.
   *
   * If you return `true` from this method, React will assume that this node's children are text, and will not create nodes for them. It will instead rely on you to have filled that text during `createInstance`. This is a performance optimization. For example, the DOM renderer returns `true` only if `type` is a known text-only parent (like `'textarea'`) or if `props.children` has a `'string'` type. If you return `true`, you will need to implement `resetTextContent` too.
   *
   * If you don't want to do anything here, you should return `false`.
   *
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  // tslint:enable:max-line-length
  shouldSetTextContent(type: Type, props: Props): boolean {
    debug("shouldSetTextContent");
    return false;
  },

  // tslint:disable:max-line-length
  /**
   * This method lets you return the initial host context from the root of the tree. See `getChildHostContext` for the explanation of host context.
   *
   * If you don't intend to use host context, you can return `null`.
   *
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  // tslint:enable:max-line-length
  getRootHostContext(rootContainer: Container): HostContext | null {
    debug("getRootHostContext");
    return null;
  },

  // tslint:disable:max-line-length
  /**
   * Host context lets you track some information about where you are in the tree so that it's available inside `createInstance` as the `hostContext` parameter. For example, the DOM renderer uses it to track whether it's inside an HTML or an SVG tree, because `createInstance` implementation needs to be different for them.
   *
   * If the node of this `type` does not influence the context you want to pass down, you can return `parentHostContext`. Alternatively, you can return any custom object representing the information you want to pass down.
   *
   * If you don't want to do anything here, return `parentHostContext`.
   *
   * This method happens **in the render phase**. Do not mutate the tree from it.
   */
  // tslint:enable:max-line-length
  getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
    rootContainer: Container
  ): HostContext {
    debug("getChildHostContext");
    return undefined;
  },

  // tslint:disable:max-line-length
  /**
   * Determines what object gets exposed as a ref. You'll likely want to return the `instance` itself. But in some cases it might make sense to only expose some part of it.
   *
   * If you don't want to do anything here, return `instance`.
   */
  // tslint:enable:max-line-length
  getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    debug("getPublicInstance");
    return instance;
  },

  // tslint:disable:max-line-length
  /**
   * This method lets you store some information before React starts making changes to the tree on the screen. For example, the DOM renderer stores the current text selection so that it can later restore it. This method is mirrored by `resetAfterCommit`.
   *
   * Even if you don't want to do anything here, you need to return `null` from it.
   */
  // tslint:enable:max-line-length
  prepareForCommit(containerInfo: Container): Record<string, any> | null {
    debug("prepareForCommit");
    return null;
  },

  // tslint:disable:max-line-length
  /**
   * This method is called right after React has performed the tree mutations. You can use it to restore something you've stored in `prepareForCommit` — for example, text selection.
   *
   * You can leave it empty.
   */
  // tslint:enable:max-line-length
  resetAfterCommit(containerInfo: Container): void {
    debug("resetAfterCommit");
  },

  /**
   * This method is called for a container that's used as a portal target. Usually you can leave it empty.
   */
  preparePortalMount(containerInfo: Container): void {
    debug("preparePortalMount");
  },

  /**
   * You can proxy this to `setTimeout` or its equivalent in your environment.
   */
  scheduleTimeout(
    fn: (...args: unknown[]) => unknown,
    delay?: number
  ): TimeoutHandle {
    debug("scheduleTimeout");
    return setTimeout(fn, delay);
  },

  /**
   * You can proxy this to `clearTimeout` or its equivalent in your environment.
   */
  cancelTimeout(id: TimeoutHandle): void {
    debug("cancelTimeout");
    clearTimeout(id);
  },

  /**
   * This is a property (not a function) that should be set to something that can never be a valid timeout ID. For example, you can set it to `-1`.
   */
  noTimeout: -1,

  // tslint:disable:max-line-length
  /**
   * Set this to `true` to indicate that your renderer supports `scheduleMicrotask`. We use microtasks as part of our discrete event implementation in React DOM. If you're not sure if your renderer should support this, you probably should. The option to not implement `scheduleMicrotask` exists so that platforms with more control over user events, like React Native, can choose to use a different mechanism.
   */
  // tslint:enable:max-line-length
  supportsMicrotasks: true,

  /**
   * Optional. You can proxy this to `queueMicrotask` or its equivalent in your environment.
   */
  scheduleMicrotask(fn: () => unknown): void {
    debug("scheduleMicrotask");
    queueMicrotask(fn);
  },

  // tslint:disable:max-line-length
  /**
   * This is a property (not a function) that should be set to `true` if your renderer is the main one on the page. For example, if you're writing a renderer for the Terminal, it makes sense to set it to `true`, but if your renderer is used *on top of* React DOM or some other existing renderer, set it to `false`.
   */
  // tslint:enable:max-line-length
  isPrimaryRenderer: true,

  // tslint:disable:max-line-length
  /**
   * To implement this method, you'll need some constants available on the special `react-reconciler/constants` entry point:
   *
   * ```
   * import {
   *   DiscreteEventPriority,
   *   ContinuousEventPriority,
   *   DefaultEventPriority,
   * } from 'react-reconciler/constants';
   *
   * const HostConfig = {
   *   // ...
   *   getCurrentEventPriority() {
   *     return DefaultEventPriority;
   *   },
   *   // ...
   * }
   *
   * const MyRenderer = Reconciler(HostConfig);
   * ```
   *
   * The constant you return depends on which event, if any, is being handled right now. (In the browser, you can check this using `window.event && window.event.type`).
   *
   * - **Discrete events**: If the active event is directly caused by the user (such as mouse and keyboard events) and each event in a sequence is intentional (e.g. click), return DiscreteEventPriority. This tells React that they should interrupt any background work and cannot be batched across time.
   *
   * - **Continuous events**: If the active event is directly caused by the user but the user can't distinguish between individual events in a sequence (e.g. mouseover), return ContinuousEventPriority. This tells React they should interrupt any background work but can be batched across time.
   *
   * - **Other events / No active event**: In all other cases, return DefaultEventPriority. This tells React that this event is considered background work, and interactive events will be prioritized over it.
   *
   * You can consult the `getCurrentEventPriority()` implementation in `ReactDOMHostConfig.js` for a reference implementation.
   */
  // tslint:enable:max-line-length
  getCurrentEventPriority(): Lane {
    debug("getCurrentEventPriority");
    return DefaultEventPriority;
  },

  getInstanceFromNode(node: any): Fiber | null | undefined {
    debug("getInstanceFromNode");
    return null;
  },

  beforeActiveInstanceBlur(): void {
    debug("beforeActiveInstanceBlur");
  },

  afterActiveInstanceBlur(): void {
    debug("afterActiveInstanceBlur");
  },

  prepareScopeUpdate(scopeInstance: any, instance: any): void {
    debug("prepareScopeUpdate");
  },

  getInstanceFromScope(scopeInstance: any): null | Instance {
    debug("getInstanceFromScope");

    return null;
  },

  detachDeletedInstance(node: Instance): void {
    debug("detachDeletedInstance");
  },

  // tslint:disable:max-line-length
  // -------------------
  // Hydration Methods
  //    (optional)
  // You can optionally implement hydration to "attach" to the existing tree during the initial render instead of creating it from scratch. For example, the DOM renderer uses this to attach to an HTML markup.
  //
  // To support hydration, you need to declare `supportsHydration: true` and then implement the methods in the "Hydration" section [listed in this file](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/forks/ReactFiberHostConfig.custom.js). File an issue if you need help.
  // -------------------
  // tslint:enable:max-line-length
  supportsHydration: false,

  // -------------------
  //  Mutation Methods
  //    (optional)
  //  If you're using React in mutation mode (you probably do), you'll need to implement a few more methods.
  // -------------------

  // tslint:disable:max-line-length
  /**
   * This method should mutate the `parentInstance` and add the child to its list of children. For example, in the DOM this would translate to a `parentInstance.appendChild(child)` call.
   *
   * Although this method currently runs in the commit phase, you still should not mutate any other nodes in it. If you need to do some additional work when a node is definitely connected to the visible tree, look at `commitMount`.
   */
  // tslint:enable:max-line-length
  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    debug("appendChild");
  },

  // tslint:disable:max-line-length
  /**
   * Same as `appendChild`, but for when a node is attached to the root container. This is useful if attaching to the root has a slightly different implementation, or if the root container nodes are of a different type than the rest of the tree.
   */
  // tslint:enable:max-line-length
  appendChildToContainer(
    container: Container,
    child: Instance | TextInstance
  ): void {
    debug("appendChildToContainer");
  },

  // tslint:disable:max-line-length
  /**
   * This method should mutate the `parentInstance` and place the `child` before `beforeChild` in the list of its children. For example, in the DOM this would translate to a `parentInstance.insertBefore(child, beforeChild)` call.
   *
   * Note that React uses this method both for insertions and for reordering nodes. Similar to DOM, it is expected that you can call `insertBefore` to reposition an existing child. Do not mutate any other parts of the tree from it.
   */
  // tslint:enable:max-line-length
  insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance | SuspenseInstance
  ): void {
    debug("insertBefore");
  },

  // tslint:disable:max-line-length
  /**
   * Same as `insertBefore`, but for when a node is attached to the root container. This is useful if attaching to the root has a slightly different implementation, or if the root container nodes are of a different type than the rest of the tree.
   */
  // tslint:enable:max-line-length
  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance | SuspenseInstance
  ): void {
    debug("insertInContainerBefore");
  },

  // tslint:disable:max-line-length
  /**
   * This method should mutate the `parentInstance` to remove the `child` from the list of its children.
   *
   * React will only call it for the top-level node that is being removed. It is expected that garbage collection would take care of the whole subtree. You are not expected to traverse the child tree in it.
   */
  // tslint:enable:max-line-length
  removeChild(
    parentInstance: Instance,
    child: Instance | TextInstance | SuspenseInstance
  ): void {
    debug("removeChild");
  },

  // tslint:disable:max-line-length
  /**
   * Same as `removeChild`, but for when a node is detached from the root container. This is useful if attaching to the root has a slightly different implementation, or if the root container nodes are of a different type than the rest of the tree.
   */
  // tslint:enable:max-line-length
  removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance | SuspenseInstance
  ): void {
    debug("removeChildFromContainer");
    const id = (child as any)?.id;
    if (typeof id === "string") {
      container.screen.removeEffect(id);
    }
  },

  // tslint:disable:max-line-length
  /**
   * If you returned `true` from `shouldSetTextContent` for the previous props, but returned `false` from `shouldSetTextContent` for the next props, React will call this method so that you can clear the text content you were managing manually. For example, in the DOM you could set `node.textContent = ''`.
   *
   * If you never return `true` from `shouldSetTextContent`, you can leave it empty.
   */
  // tslint:enable:max-line-length
  resetTextContent(instance: Instance): void {
    debug("resetTextContent");
  },

  /**
   * This method should mutate the `textInstance` and update its text content to `nextText`.
   *
   * Here, `textInstance` is a node created by `createTextInstance`.
   */
  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string
  ): void {
    debug("commitTextUpdate");
  },

  // tslint:disable:max-line-length
  /**
   * This method is only called if you returned `true` from `finalizeInitialChildren` for this instance.
   *
   * It lets you do some additional work after the node is actually attached to the tree on the screen for the first time. For example, the DOM renderer uses it to trigger focus on nodes with the `autoFocus` attribute.
   *
   * Note that `commitMount` does not mirror `removeChild` one to one because `removeChild` is only called for the top-level removed node. This is why ideally `commitMount` should not mutate any nodes other than the `instance` itself. For example, if it registers some events on some node above, it will be your responsibility to traverse the tree in `removeChild` and clean them up, which is not ideal.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its internal fields, be aware that it may change significantly between versions. You're taking on additional maintenance risk by reading from it, and giving up all guarantees if you write something to it.
   *
   * If you never return `true` from `finalizeInitialChildren`, you can leave it empty.
   */
  // tslint:enable:max-line-length
  commitMount(
    instance: Instance,
    type: Type,
    props: Props,
    internalInstanceHandle: OpaqueHandle
  ): void {
    debug("commitMount");
  },

  // tslint:disable:max-line-length
  /**
   * This method should mutate the `instance` according to the set of changes in `updatePayload`. Here, `updatePayload` is the object that you've returned from `prepareUpdate` and has an arbitrary structure that makes sense for your renderer. For example, the DOM renderer returns an update payload like `[prop1, value1, prop2, value2, ...]` from `prepareUpdate`, and that structure gets passed into `commitUpdate`. Ideally, all the diffing and calculation should happen inside `prepareUpdate` so that `commitUpdate` can be fast and straightforward.
   *
   * The `internalHandle` data structure is meant to be opaque. If you bend the rules and rely on its internal fields, be aware that it may change significantly between versions. You're taking on additional maintenance risk by reading from it, and giving up all guarantees if you write something to it.
   */
  // tslint:enable:max-line-length
  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    prevProps: Props,
    nextProps: Props,
    internalHandle: OpaqueHandle
  ): void {
    debug("commitUpdate");
  },

  // tslint:disable:max-line-length
  /**
   * This method should make the `instance` invisible without removing it from the tree. For example, it can apply visual styling to hide it. It is used by Suspense to hide the tree while the fallback is visible.
   */
  // tslint:enable:max-line-length
  hideInstance(instance: Instance): void {
    debug("hideInstance");
  },

  /**
   * Same as `hideInstance`, but for nodes created by `createTextInstance`.
   */
  hideTextInstance(textInstance: TextInstance): void {
    debug("hideTextInstance");
  },

  /**
   * This method should make the `instance` visible, undoing what `hideInstance` did.
   */
  unhideInstance(instance: Instance, props: Props): void {
    debug("unhideInstance");
  },

  /**
   * Same as `unhideInstance`, but for nodes created by `createTextInstance`.
   */
  unhideTextInstance(textInstance: TextInstance, text: string): void {
    debug("unhideTextInstance");
  },

  /**
   * This method should mutate the `container` root node and remove all children from it.
   */
  clearContainer(container: Container): void {
    debug("clearContainer");
  },
};
