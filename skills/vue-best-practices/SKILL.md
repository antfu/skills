---
name: vue-best-practices
description: MUST be used for Vue.js tasks. Strongly recommends Composition API with `<script setup>` and TypeScript as the standard approach. Covers Vue 3, SSR, Volar, vue-tsc. Load for any Vue, .vue files, Vue Router, Pinia, or Vite with Vue work. ALWAYS use Composition API unless the project explicitly requires Options API.
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "17.0.0"
---

Vue 3 best practices, common gotchas, and performance optimization.

### Reactivity
- Accessing ref() values without .value in scripts → See [ref-value-access](reference/ref-value-access.md)
- Destructuring reactive() objects, losing reactivity → See [reactive-destructuring](reference/reactive-destructuring.md)
- Choosing between ref() and reactive() for state → See [prefer-ref-over-reactive](reference/prefer-ref-over-reactive.md)
- Accessing refs inside arrays and collections → See [refs-in-collections-need-value](reference/refs-in-collections-need-value.md)
- Large objects or external library data overhead → See [shallow-ref-for-performance](reference/shallow-ref-for-performance.md)
- Using nested refs in template expressions → See [template-ref-unwrapping-top-level](reference/template-ref-unwrapping-top-level.md)
- Comparing reactive objects with === operator → See [reactivity-proxy-identity-hazard](reference/reactivity-proxy-identity-hazard.md)
- Library instances breaking in reactive state → See [reactivity-markraw-for-non-reactive](reference/reactivity-markraw-for-non-reactive.md)
- Expecting watchers to fire for each state change → See [reactivity-same-tick-batching](reference/reactivity-same-tick-batching.md)
- Integrating external state management libraries → See [reactivity-external-state-integration](reference/reactivity-external-state-integration.md)
- Deriving state with watchEffect instead of computed → See [reactivity-computed-over-watcheffect-mutations](reference/reactivity-computed-over-watcheffect-mutations.md)

### Computed
- Computed getter is making API calls or mutations → See [computed-no-side-effects](reference/computed-no-side-effects.md)
- Mutating computed values causes lost changes unexpectedly → See [computed-return-value-readonly](reference/computed-return-value-readonly.md)
- Computed property doesn't update when expected → See [computed-conditional-dependencies](reference/computed-conditional-dependencies.md)
- Sorting or reversing arrays destroys original data → See [computed-array-mutation](reference/computed-array-mutation.md)
- Expensive operations running too frequently every render → See [computed-vs-methods-caching](reference/computed-vs-methods-caching.md)
- Trying to pass arguments to computed properties → See [computed-no-parameters](reference/computed-no-parameters.md)
- Complex conditions bloating inline class bindings → See [computed-properties-for-class-logic](reference/computed-properties-for-class-logic.md)

### Watchers
- Need to watch a reactive object property → See [watch-reactive-property-getter](reference/watch-reactive-property-getter.md)
- Large nested data structures causing performance issues → See [watch-deep-performance](reference/watch-deep-performance.md)
- Dependencies accessed after await not tracking → See [watcheffect-async-dependency-tracking](reference/watcheffect-async-dependency-tracking.md)
- Need to access updated DOM in watchers → See [watch-flush-timing](reference/watch-flush-timing.md)
- Uncertain whether to use watch or watchEffect → See [watch-vs-watcheffect](reference/watch-vs-watcheffect.md)
- Duplicating initial calls and watch callbacks → See [watch-immediate-option](reference/watch-immediate-option.md)
- Can't compare old and new values correctly → See [watch-deep-same-object-reference](reference/watch-deep-same-object-reference.md)
- Template refs appearing null or stale → See [watcheffect-flush-post-for-refs](reference/watcheffect-flush-post-for-refs.md)

### Components
- Prop values being changed from a child component → See [props-are-read-only](reference/props-are-read-only.md)
- Grandparent can't listen to grandchild emitted events → See [component-events-dont-bubble](reference/component-events-dont-bubble.md)
- Distinguishing Vue components from native elements → See [component-naming-pascalcase](reference/component-naming-pascalcase.md)
- Recursive component needs to reference itself → See [self-referencing-component-name](reference/self-referencing-component-name.md)
- Bundle includes components that aren't used → See [prefer-local-component-registration](reference/prefer-local-component-registration.md)
- Tight coupling through component ref access → See [prefer-props-emit-over-component-refs](reference/prefer-props-emit-over-component-refs.md)

### Props & Emits
- Boolean prop not parsing as expected → See [prop-boolean-casting-order](reference/prop-boolean-casting-order.md)
- Composable doesn't update when props change → See [prop-composable-reactivity-loss](reference/prop-composable-reactivity-loss.md)
- Destructured props not updating watchers → See [prop-destructured-watch-getter](reference/prop-destructured-watch-getter.md)
- Prop validation needs component instance data → See [prop-validation-before-instance](reference/prop-validation-before-instance.md)
- Event name inconsistency in templates and scripts → See [emit-kebab-case-in-templates](reference/emit-kebab-case-in-templates.md)
- Event payloads need validation during development → See [emit-validation-for-complex-payloads](reference/emit-validation-for-complex-payloads.md)

### Templates
- Rendering untrusted user content as HTML → See [v-html-xss-security](reference/v-html-xss-security.md)
- Filtering or conditionally hiding list items → See [no-v-if-with-v-for](reference/no-v-if-with-v-for.md)
- Functions in templates modifying data unexpectedly → See [template-functions-no-side-effects](reference/template-functions-no-side-effects.md)
- Performance issues with filtered or sorted lists → See [v-for-use-computed-for-filtering](reference/v-for-use-computed-for-filtering.md)
- Deciding between v-if and v-show for conditionals → See [v-if-vs-v-show-performance](reference/v-if-vs-v-show-performance.md)

### Forms & v-model
- Need to handle v-model modifiers in child → See [definemodel-hidden-modifier-props](reference/definemodel-hidden-modifier-props.md)
- Need to use updated value immediately after change → See [definemodel-value-next-tick](reference/definemodel-value-next-tick.md)
- Migrating Vue 2 components to Vue 3 → See [v-model-vue3-breaking-changes](reference/v-model-vue3-breaking-changes.md)

### Events & Modifiers
- Need to handle same event only one time → See [event-once-modifier-for-single-use](reference/event-once-modifier-for-single-use.md)
- Keyboard shortcuts fire with unintended modifier combinations → See [exact-modifier-for-precise-shortcuts](reference/exact-modifier-for-precise-shortcuts.md)
- Using left-handed mouse or non-standard input devices → See [mouse-button-modifiers-intent](reference/mouse-button-modifiers-intent.md)
- Preventing default browser action and scroll performance together → See [no-passive-with-prevent](reference/no-passive-with-prevent.md)

### Lifecycle
- Lifecycle hooks don't execute asynchronously → See [lifecycle-hooks-synchronous-registration](reference/lifecycle-hooks-synchronous-registration.md)
- Expensive operations slow performance drastically → See [updated-hook-performance](reference/updated-hook-performance.md)

### Slots
- Accessing child component data in slot content → See [slot-render-scope-parent-only](reference/slot-render-scope-parent-only.md)
- Mixing named and scoped slots together → See [slot-named-scoped-explicit-default](reference/slot-named-scoped-explicit-default.md)
- Using v-slot on native HTML elements → See [slot-v-slot-on-components-or-templates-only](reference/slot-v-slot-on-components-or-templates-only.md)
- Empty wrapper elements rendering unnecessarily → See [slot-conditional-rendering-with-slots](reference/slot-conditional-rendering-with-slots.md)
- Scoped slot props lack TypeScript type safety → See [slot-define-slots-for-typescript](reference/slot-define-slots-for-typescript.md)
- Rendering empty component slots without defaults → See [slot-fallback-content-default-values](reference/slot-fallback-content-default-values.md)
- Confused about which slot content goes where → See [slot-implicit-default-content](reference/slot-implicit-default-content.md)
- Expecting name property in scoped slot props → See [slot-name-reserved-prop](reference/slot-name-reserved-prop.md)
- Choosing between renderless components and composables → See [slot-renderless-components-vs-composables](reference/slot-renderless-components-vs-composables.md)

### Provide/Inject
- String keys collide in large applications → See [provide-inject-symbol-keys](reference/provide-inject-symbol-keys.md)
- State mutations scattered across components → See [provide-inject-mutations-in-provider](reference/provide-inject-mutations-in-provider.md)
- Passing props through many component layers → See [avoid-prop-drilling-use-provide-inject](reference/avoid-prop-drilling-use-provide-inject.md)

### Attrs
- Accessing hyphenated attributes in JavaScript code → See [attrs-hyphenated-property-access](reference/attrs-hyphenated-property-access.md)
- Watching fallthrough attributes for changes with watch() → See [attrs-not-reactive](reference/attrs-not-reactive.md)

### Composables
- Composable has unexpected side effects affecting external state → See [composable-avoid-hidden-side-effects](reference/composable-avoid-hidden-side-effects.md)
- Building complex logic from smaller focused composables → See [composable-composition-pattern](reference/composable-composition-pattern.md)
- Inconsistent composable names or destructuring loses reactivity → See [composable-naming-return-pattern](reference/composable-naming-return-pattern.md)
- Composable has many optional parameters or confusing argument order → See [composable-options-object-pattern](reference/composable-options-object-pattern.md)
- Need to prevent uncontrolled mutations of composable state → See [composable-readonly-state](reference/composable-readonly-state.md)
- Unsure whether logic belongs in composable or utility function → See [composable-vs-utility-functions](reference/composable-vs-utility-functions.md)

### Composition API
- Optimizing production bundle size and performance → See [composition-api-bundle-size-minification](reference/composition-api-bundle-size-minification.md)
- Composition API code becoming scattered and hard to maintain → See [composition-api-code-organization](reference/composition-api-code-organization.md)
- Fixing naming conflicts and unclear data origins in mixins → See [composition-api-mixins-replacement](reference/composition-api-mixins-replacement.md)
- Applying functional patterns incorrectly to Vue state → See [composition-api-not-functional-programming](reference/composition-api-not-functional-programming.md)
- Gradually migrating large Options API codebase → See [composition-api-options-api-coexistence](reference/composition-api-options-api-coexistence.md)
- Coming from React, over-engineering Vue patterns unnecessarily → See [composition-api-vs-react-hooks-differences](reference/composition-api-vs-react-hooks-differences.md)

### Directives
- Storing state across directive hooks → See [directive-arguments-read-only](reference/directive-arguments-read-only.md)
- Applying custom directives to Vue components → See [directive-avoid-on-components](reference/directive-avoid-on-components.md)
- Creating intervals or event listeners in directives → See [directive-cleanup-in-unmounted](reference/directive-cleanup-in-unmounted.md)
- Simplifying directives with identical behavior → See [directive-function-shorthand](reference/directive-function-shorthand.md)
- Using custom directives in script setup → See [directive-naming-v-prefix](reference/directive-naming-v-prefix.md)
- Choosing between custom and built-in directives → See [directive-prefer-declarative-templating](reference/directive-prefer-declarative-templating.md)
- Deciding between directives and components → See [directive-vs-component-decision](reference/directive-vs-component-decision.md)
- Migrating Vue 2 directives to Vue 3 → See [directive-vue2-migration-hooks](reference/directive-vue2-migration-hooks.md)

### Transitions
- Wrapping multiple elements or components in transitions → See [transition-single-element-slot](reference/transition-single-element-slot.md)
- Transitioning between same element types without animation → See [transition-key-for-same-element](reference/transition-key-for-same-element.md)
- Using JavaScript animations without calling done callback → See [transition-js-hooks-done-callback](reference/transition-js-hooks-done-callback.md)
- Animating lists with TransitionGroup without unique keys → See [transition-group-key-requirement](reference/transition-group-key-requirement.md)
- Performance problems with janky list animations → See [transition-animate-transform-opacity](reference/transition-animate-transform-opacity.md)
- Move animations failing on inline list elements → See [transition-group-flip-inline-elements](reference/transition-group-flip-inline-elements.md)
- List items jumping instead of smoothly animating → See [transition-group-move-animation-position-absolute](reference/transition-group-move-animation-position-absolute.md)
- Vue 2 to Vue 3 transition layout breaks unexpectedly → See [transition-group-no-default-wrapper-vue3](reference/transition-group-no-default-wrapper-vue3.md)
- Trying to sequence list animations with mode prop → See [transition-group-no-mode-prop](reference/transition-group-no-mode-prop.md)
- Creating cascading delays for list item animations → See [transition-group-staggered-animations](reference/transition-group-staggered-animations.md)
- Overlapping elements or layout jumping during transitions → See [transition-mode-out-in](reference/transition-mode-out-in.md)
- Nested transition animations cutting off prematurely → See [transition-nested-duration](reference/transition-nested-duration.md)
- Reusable transition components with scoped styles breaking → See [transition-reusable-scoped-style](reference/transition-reusable-scoped-style.md)
- RouterView transitions unexpectedly animating on page load → See [transition-router-view-appear](reference/transition-router-view-appear.md)
- Mixing CSS transitions and animations causing timing issues → See [transition-type-when-mixed](reference/transition-type-when-mixed.md)
- Component cleanup not firing during fast transition replacements → See [transition-unmount-hook-timing](reference/transition-unmount-hook-timing.md)

### Animation
- Need to animate elements staying in DOM → See [animation-class-based-technique](reference/animation-class-based-technique.md)
- Animations not triggering on content changes → See [animation-key-for-rerender](reference/animation-key-for-rerender.md)
- Building interactive animations with user input → See [animation-state-driven-technique](reference/animation-state-driven-technique.md)
- Animating list changes causing noticeable lag → See [animation-transitiongroup-performance](reference/animation-transitiongroup-performance.md)

### KeepAlive
- Using KeepAlive without proper cache limits or cleanup → See [keepalive-memory-management](reference/keepalive-memory-management.md)
- KeepAlive include/exclude props not matching cached components → See [keepalive-component-name-requirement](reference/keepalive-component-name-requirement.md)
- Need to programmatically remove component from KeepAlive cache → See [keepalive-no-cache-removal-vue3](reference/keepalive-no-cache-removal-vue3.md)
- Users see stale cached content when expecting fresh page data → See [keepalive-router-fresh-vs-cached](reference/keepalive-router-fresh-vs-cached.md)
- Child components mount twice with nested Vue Router routes → See [keepalive-router-nested-double-mount](reference/keepalive-router-nested-double-mount.md)
- Memory grows when combining KeepAlive with Transition animations → See [keepalive-transition-memory-leak](reference/keepalive-transition-memory-leak.md)
- Dynamic component state resets when switching between them → See [dynamic-components-with-keepalive](reference/dynamic-components-with-keepalive.md)

### Async Components
- Setting up Vue Router route component loading → See [async-component-vue-router](reference/async-component-vue-router.md)
- Async component options ignored by parent Suspense → See [async-component-suspense-control](reference/async-component-suspense-control.md)
- Improving Time to Interactive with SSR apps → See [async-component-hydration-strategies](reference/async-component-hydration-strategies.md)
- Loading spinner flashing on fast networks → See [async-component-loading-delay](reference/async-component-loading-delay.md)

### Render Functions
- Render function from setup doesn't update reactively → See [rendering-render-function-return-from-setup](reference/rendering-render-function-return-from-setup.md)
- Same vnode appearing multiple times in tree → See [render-function-vnodes-must-be-unique](reference/render-function-vnodes-must-be-unique.md)
- Rendering lists in render functions without keys → See [render-function-v-for-keys-required](reference/render-function-v-for-keys-required.md)
- Implementing .stop, .prevent in render functions → See [render-function-event-modifiers](reference/render-function-event-modifiers.md)
- Two-way binding on components in render functions → See [render-function-v-model-implementation](reference/render-function-v-model-implementation.md)
- Using string names for components in render functions → See [rendering-resolve-component-for-string-names](reference/rendering-resolve-component-for-string-names.md)
- Accessing vnode internals like el or shapeFlag → See [render-function-avoid-internal-vnode-properties](reference/render-function-avoid-internal-vnode-properties.md)
- Creating simple stateless presentational components → See [render-function-functional-components](reference/render-function-functional-components.md)
- Applying custom directives in render functions → See [render-function-custom-directives](reference/render-function-custom-directives.md)
- Excessive rerenders from watchers or deep watchers → See [rendering-excessive-rerenders-watch-vs-computed](reference/rendering-excessive-rerenders-watch-vs-computed.md)
- Choosing render functions over templates → See [rendering-prefer-templates-over-render-functions](reference/rendering-prefer-templates-over-render-functions.md)
- Migrating Vue 2 render functions to Vue 3 → See [rendering-render-function-h-import-vue3](reference/rendering-render-function-h-import-vue3.md)
- Passing slot content to h() incorrectly → See [rendering-render-function-slots-as-functions](reference/rendering-render-function-slots-as-functions.md)
- Understanding Vue's vdom optimization blocks → See [rendering-understand-vdom-block-structure](reference/rendering-understand-vdom-block-structure.md)

### Teleport
- Modal breaks with parent CSS transforms → See [teleport-css-positioning-issues](reference/teleport-css-positioning-issues.md)
- Content needs different layout on mobile → See [teleport-disabled-for-responsive](reference/teleport-disabled-for-responsive.md)
- Unsure if props/events work through teleport → See [teleport-logical-hierarchy-preserved](reference/teleport-logical-hierarchy-preserved.md)
- Multiple modals targeting same container → See [teleport-multiple-to-same-target](reference/teleport-multiple-to-same-target.md)
- Scoped styles not applying to teleported content → See [teleport-scoped-styles-limitation](reference/teleport-scoped-styles-limitation.md)

### Suspense
- Want to track Suspense loading states programmatically → See [suspense-events-for-state-tracking](reference/suspense-events-for-state-tracking.md)
- Planning Suspense usage in production applications → See [suspense-experimental-api-stability](reference/suspense-experimental-api-stability.md)
- Fallback not showing when content changes → See [suspense-fallback-not-immediate-on-revert](reference/suspense-fallback-not-immediate-on-revert.md)
- Nesting Suspense components together → See [suspense-nested-suspensible-prop](reference/suspense-nested-suspensible-prop.md)
- Combining Suspense with Router, Transition, KeepAlive → See [suspense-nesting-order-with-router](reference/suspense-nesting-order-with-router.md)
- Nested async component not showing loading indicator → See [suspense-revert-only-on-root-change](reference/suspense-revert-only-on-root-change.md)
- Multiple async components in single Suspense → See [suspense-single-child-requirement](reference/suspense-single-child-requirement.md)

### TypeScript
- Declaring props with TypeScript in composition API components → See [ts-defineprops-type-based-declaration](reference/ts-defineprops-type-based-declaration.md)
- Providing default values to mutable prop types → See [ts-withdefaults-mutable-factory-function](reference/ts-withdefaults-mutable-factory-function.md)
- Typing reactive state with ref unwrapping concerns → See [ts-reactive-no-generic-argument](reference/ts-reactive-no-generic-argument.md)
- Accessing DOM elements after component mounts → See [ts-template-ref-null-handling](reference/ts-template-ref-null-handling.md)
- Typing refs to child Vue components → See [ts-component-ref-typeof-instancetype](reference/ts-component-ref-typeof-instancetype.md)
- Using custom directives with TypeScript support → See [ts-custom-directive-type-augmentation](reference/ts-custom-directive-type-augmentation.md)
- Declaring component events with full type safety → See [ts-defineemits-type-based-syntax](reference/ts-defineemits-type-based-syntax.md)
- Handling optional boolean props in TypeScript → See [ts-defineprops-boolean-default-false](reference/ts-defineprops-boolean-default-false.md)
- Using imported types safely in defineProps → See [ts-defineprops-imported-types-limitations](reference/ts-defineprops-imported-types-limitations.md)
- Handling DOM events with strict TypeScript checking → See [ts-event-handler-explicit-typing](reference/ts-event-handler-explicit-typing.md)
- Sharing data between components with type safety → See [ts-provide-inject-injection-key](reference/ts-provide-inject-injection-key.md)
- Storing Vue components in reactive state → See [ts-shallowref-for-dynamic-components](reference/ts-shallowref-for-dynamic-components.md)
- Working with union types in Vue templates → See [ts-template-type-casting](reference/ts-template-type-casting.md)

### SSR
- User data leaking between server requests → See [state-ssr-cross-request-pollution](reference/state-ssr-cross-request-pollution.md)
- Code runs on both server and browser environments → See [ssr-platform-specific-apis](reference/ssr-platform-specific-apis.md)
- Custom directives not displaying on server-rendered HTML → See [ssr-custom-directive-getssrprops](reference/ssr-custom-directive-getssrprops.md)

### Performance
- Many list items re-rendering unnecessarily during state changes → See [perf-props-stability-update-optimization](reference/perf-props-stability-update-optimization.md)
- Rendering hundreds or thousands of items causing DOM performance issues → See [perf-virtualize-large-lists](reference/perf-virtualize-large-lists.md)
- Static content re-evaluated on every parent component update → See [perf-v-once-v-memo-directives](reference/perf-v-once-v-memo-directives.md)
- List performance degrading from deeply nested component structure → See [perf-avoid-component-abstraction-in-lists](reference/perf-avoid-component-abstraction-in-lists.md)
- Computed properties returning objects triggering effects unexpectedly → See [perf-computed-object-stability](reference/perf-computed-object-stability.md)
- Page load metrics suffering from client-side JavaScript execution delay → See [perf-ssr-ssg-for-page-load](reference/perf-ssr-ssg-for-page-load.md)

### SFC (Single File Components)
- Starting a Vue project with a build setup → See [sfc-recommended-for-build-projects](reference/sfc-recommended-for-build-projects.md)
- Styling child component elements with scoped CSS → See [sfc-scoped-css-child-component-styling](reference/sfc-scoped-css-child-component-styling.md)
- Styling content added dynamically with v-html → See [sfc-scoped-css-dynamic-content](reference/sfc-scoped-css-dynamic-content.md)
- Optimizing scoped CSS selector performance → See [sfc-scoped-css-performance](reference/sfc-scoped-css-performance.md)
- Styling content passed through component slots → See [sfc-scoped-css-slot-content](reference/sfc-scoped-css-slot-content.md)
- Organizing component template, logic, and styles → See [sfc-separation-of-concerns-colocate](reference/sfc-separation-of-concerns-colocate.md)
- Binding inline styles with property names → See [style-binding-camelcase](reference/style-binding-camelcase.md)
- Building Tailwind classes with string concatenation → See [tailwind-dynamic-class-generation](reference/tailwind-dynamic-class-generation.md)

### Plugins
- Global properties not available in setup function → See [plugin-prefer-provide-inject-over-global-properties](reference/plugin-prefer-provide-inject-over-global-properties.md)
- Creating a new Vue plugin from scratch → See [plugin-structure-install-method](reference/plugin-structure-install-method.md)
- Preventing collisions between multiple plugins → See [plugin-symbol-injection-keys](reference/plugin-symbol-injection-keys.md)
- Global properties missing TypeScript autocomplete support → See [plugin-typescript-type-augmentation](reference/plugin-typescript-type-augmentation.md)

### App Configuration
- Need to chain app configuration methods after mount → See [mount-return-value](reference/mount-return-value.md)
- Vue only controlling specific page sections → See [multiple-app-instances](reference/multiple-app-instances.md)
- Migrating dynamic component registration to Vite → See [dynamic-component-registration-vite](reference/dynamic-component-registration-vite.md)
