---
title: Use .once Modifier for Single-Use Event Handlers
impact: LOW
impactDescription: The .once modifier auto-removes event listeners after first trigger, preventing repeated handler calls
type: best-practice
tags: [vue3, events, modifiers, once, event-handling]
---

# Use .once Modifier for Single-Use Event Handlers

**Impact: LOW** - Vue provides a `.once` modifier for event listeners that automatically removes the listener after it fires once. This is useful for one-time events like initialization callbacks, first-interaction tracking, or one-time animations.

## Task Checklist

- [ ] Use `.once` for events that should only fire once
- [ ] Consider `.once` for analytics first-interaction tracking
- [ ] Use `.once` for initialization events
- [ ] Remember `.once` works on both native and component events

## Basic Usage

**Component events:**
```vue
<template>
  <!-- Handler fires only on first emit, then stops listening -->
  <ChildComponent @initialized.once="handleInit" />

  <!-- First-time user interaction tracking -->
  <UserForm @submit.once="trackFirstSubmit" />
</template>

<script setup>
function handleInit(data) {
  console.log('Component initialized:', data)
  // This only runs once, even if child emits 'initialized' multiple times
}

function trackFirstSubmit() {
  analytics.track('first_form_submit')
}
</script>
```

**Native DOM events:**
```vue
<template>
  <!-- First click only -->
  <button @click.once="showWelcomeMessage">
    Click to see welcome (once)
  </button>

  <!-- First scroll only -->
  <div @scroll.once="loadMoreContent">
    Scroll to load more
  </div>
</template>
```

## Common Use Cases

### One-Time Initialization
```vue
<template>
  <ThirdPartyChart
    @ready.once="onChartReady"
    :data="chartData"
  />
</template>

<script setup>
function onChartReady(chartInstance) {
  // Store reference, configure chart
  // Only need to do this once
  chartRef.value = chartInstance
  chartInstance.setOption(customOptions)
}
</script>
```

### First Interaction Analytics
```vue
<template>
  <article @click.once="trackEngagement">
    <h2>{{ article.title }}</h2>
    <p>{{ article.excerpt }}</p>
  </article>
</template>

<script setup>
function trackEngagement() {
  analytics.track('article_first_click', {
    articleId: article.id
  })
}
</script>
```

### Lazy Loading Trigger
```vue
<template>
  <div
    ref="lazyContainer"
    @mouseenter.once="loadHeavyContent"
  >
    <template v-if="loaded">
      <HeavyComponent :data="data" />
    </template>
    <template v-else>
      <Placeholder />
    </template>
  </div>
</template>

<script setup>
const loaded = ref(false)
const data = ref(null)

async function loadHeavyContent() {
  data.value = await fetchData()
  loaded.value = true
}
</script>
```

### One-Time Animation
```vue
<template>
  <Transition
    @after-enter.once="onFirstAppearance"
  >
    <div v-if="show" class="animated-content">
      Content
    </div>
  </Transition>
</template>

<script setup>
function onFirstAppearance() {
  // Track first time user sees this element
  // Won't fire again if element leaves and re-enters
}
</script>
```

## Combining with Other Modifiers

```vue
<template>
  <!-- Once + prevent default -->
  <form @submit.once.prevent="handleFirstSubmit">
    ...
  </form>

  <!-- Once + stop propagation -->
  <div @click.once.stop="handleClick">
    ...
  </div>

  <!-- Once + key modifier -->
  <input @keyup.enter.once="submitOnFirstEnter" />
</template>
```

## Equivalent Manual Implementation

Without `.once`, you'd need to manually track and remove:

```vue
<script setup>
const hasHandled = ref(false)

function handleClickManually() {
  if (hasHandled.value) return
  hasHandled.value = true

  // Do one-time action
  doSomething()
}
</script>

<template>
  <!-- Manual approach - more verbose -->
  <button @click="handleClickManually">Click</button>

  <!-- .once approach - cleaner -->
  <button @click.once="doSomething">Click</button>
</template>
```

## When NOT to Use .once

Don't use `.once` when:
- You need the event to fire multiple times
- You want to conditionally allow repeated fires
- The "once" logic is complex (use manual ref tracking instead)

```vue
<template>
  <!-- DON'T: User expects multiple submissions to work -->
  <form @submit.once.prevent="handleSubmit">
    ...
  </form>

  <!-- DO: Allow repeated submissions -->
  <form @submit.prevent="handleSubmit">
    ...
  </form>
</template>
```

## Reference
- [Vue.js Event Handling - Event Modifiers](https://vuejs.org/guide/essentials/event-handling.html#event-modifiers)
- [Vue.js Component Events](https://vuejs.org/guide/components/events.html)
