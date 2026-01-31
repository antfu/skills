---
title: Use mode="out-in" for Sequential Element Transitions
impact: MEDIUM
impactDescription: Without transition mode, entering and leaving elements animate simultaneously, causing overlap and layout issues
type: best-practice
tags: [vue3, transition, animation, mode, out-in, in-out]
---

# Use mode="out-in" for Sequential Element Transitions

**Impact: MEDIUM** - By default, Vue's `<Transition>` runs enter and leave animations simultaneously. This causes the old and new elements to overlap during the transition, often resulting in visual glitches, layout jumping, or elements appearing stacked. Use `mode="out-in"` to ensure the old element fully animates out before the new one enters.

## Task Checklist

- [ ] Use `mode="out-in"` when transitioning between mutually exclusive elements
- [ ] This is especially important for buttons, tabs, or content that shouldn't overlap
- [ ] Consider `mode="in-out"` only for specific overlapping effects (rare)
- [ ] Without a mode, both animations run in parallel (default behavior)

**Problematic Code:**
```vue
<template>
  <!-- BAD: No mode - buttons overlap during transition! -->
  <Transition name="fade">
    <button v-if="isEditing" key="save" @click="save">Save</button>
    <button v-else key="edit" @click="edit">Edit</button>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<!--
Result: Both buttons visible during transition
- Old button fading out
- New button fading in simultaneously
- Layout breaks as both take space
-->
```

**Correct Code:**
```vue
<template>
  <!-- GOOD: out-in mode ensures sequential animation -->
  <Transition name="fade" mode="out-in">
    <button v-if="isEditing" key="save" @click="save">Save</button>
    <button v-else key="edit" @click="edit">Edit</button>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<!--
Result: Clean sequential animation
1. Edit button fades out completely
2. Save button fades in
No overlap, no layout issues
-->
```

## Transition Modes Explained

### No Mode (Default)
```
Time:     |----- leave animation -----|
          |----- enter animation -----|

Elements are animated simultaneously (parallel)
```

### mode="out-in" (Recommended for most cases)
```
Time:     |----- leave animation -----|
                                      |----- enter animation -----|

Old element leaves first, then new element enters (sequential)
```

### mode="in-out" (Rare use case)
```
Time:                                 |----- leave animation -----|
          |----- enter animation -----|

New element enters first, then old element leaves
```

## When to Use Each Mode

### Use `mode="out-in"` for:
- Toggle buttons (Edit/Save, Play/Pause)
- Tab content switching
- Multi-step forms
- State-based content (Loading/Error/Success)
- Any mutually exclusive content

```vue
<template>
  <!-- Tab content switching -->
  <Transition name="slide" mode="out-in">
    <component :is="currentTabComponent" :key="currentTab" />
  </Transition>

  <!-- State-based UI -->
  <Transition name="fade" mode="out-in">
    <LoadingSpinner v-if="loading" key="loading" />
    <ErrorMessage v-else-if="error" key="error" :message="error" />
    <DataDisplay v-else key="data" :data="data" />
  </Transition>
</template>
```

### Use `mode="in-out"` for:
- Card flip effects where new content appears behind old
- Specific design requirements where overlap is intentional
- Rarely used in practice

```vue
<template>
  <!-- Card flip effect - new card slides in behind -->
  <Transition name="flip" mode="in-out">
    <div :key="cardId" class="card">{{ cardContent }}</div>
  </Transition>
</template>
```

### Use No Mode for:
- Cross-fade effects where overlap is desired
- Image galleries with smooth blending
- Background transitions

```vue
<template>
  <!-- Image cross-fade - overlap creates smooth blend -->
  <Transition name="crossfade">
    <img :key="currentImage" :src="currentImage" class="gallery-image" />
  </Transition>
</template>

<style>
.gallery-image {
  position: absolute; /* Stack images on top of each other */
}

.crossfade-enter-active,
.crossfade-leave-active {
  transition: opacity 0.5s;
}

.crossfade-enter-from,
.crossfade-leave-to {
  opacity: 0;
}
</style>
```

## Handling Absolute Positioning

If you must use the default mode (no mode) for non-overlapping elements, use absolute positioning:

```vue
<template>
  <div class="container">
    <Transition name="slide">
      <div v-if="showA" key="a" class="panel">Panel A</div>
      <div v-else key="b" class="panel">Panel B</div>
    </Transition>
  </div>
</template>

<style>
.container {
  position: relative;
  height: 200px; /* Fixed height needed */
}

.panel {
  position: absolute;
  width: 100%;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
```

## Reference
- [Vue.js Transition Modes](https://vuejs.org/guide/built-ins/transition.html#transition-modes)
