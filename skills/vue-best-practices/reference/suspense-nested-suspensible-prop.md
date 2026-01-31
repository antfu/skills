# Use suspensible Prop for Nested Suspense (Vue 3.3+)

## Rule

When nesting `<Suspense>` components, use the `suspensible` prop on the inner Suspense to properly coordinate with the parent Suspense. Without this prop, nested async components may render empty nodes until resolved instead of showing fallback content.

## Why This Matters

Without the `suspensible` prop, the inner `<Suspense>` is treated as a synchronous component by the parent. This causes:
- Empty nodes appearing briefly during async resolution
- Multiple patching cycles as the component tree updates
- Inconsistent loading states that confuse users

## Bad Code

```vue
<template>
  <Suspense>
    <component :is="DynamicAsyncOuter">
      <!-- DynamicAsyncInner renders EMPTY until resolved! -->
      <component :is="DynamicAsyncInner" />
    </component>

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

```vue
<template>
  <Suspense>
    <OuterLayout>
      <!-- Inner Suspense not coordinated with parent -->
      <Suspense>
        <AsyncWidget />
        <template #fallback>Loading widget...</template>
      </Suspense>
    </OuterLayout>

    <template #fallback>
      Loading layout...
    </template>
  </Suspense>
</template>
```

## Good Code

```vue
<template>
  <Suspense>
    <component :is="DynamicAsyncOuter">
      <!-- Inner Suspense with suspensible prop -->
      <Suspense suspensible>
        <component :is="DynamicAsyncInner" />
        <template #fallback>
          <InnerLoadingState />
        </template>
      </Suspense>
    </component>

    <template #fallback>
      <OuterLoadingState />
    </template>
  </Suspense>
</template>
```

## Complex Layout Example

```vue
<template>
  <Suspense>
    <DashboardLayout>
      <template #sidebar>
        <!-- Sidebar has its own Suspense boundary -->
        <Suspense suspensible>
          <AsyncSidebar />
          <template #fallback>
            <SidebarSkeleton />
          </template>
        </Suspense>
      </template>

      <template #main>
        <!-- Main content has its own Suspense boundary -->
        <Suspense suspensible>
          <AsyncMainContent :key="contentKey" />
          <template #fallback>
            <ContentSkeleton />
          </template>
        </Suspense>
      </template>

      <template #widgets>
        <!-- Each widget can load independently -->
        <Suspense suspensible>
          <AsyncWidgets />
          <template #fallback>
            <WidgetsSkeleton />
          </template>
        </Suspense>
      </template>
    </DashboardLayout>

    <template #fallback>
      <FullPageLoader />
    </template>
  </Suspense>
</template>
```

## How suspensible Works

| Configuration | Behavior |
|--------------|----------|
| No `suspensible` prop | Inner Suspense treated as sync; parent doesn't wait for inner async deps |
| `suspensible` on inner | Inner async deps bubble up to parent Suspense for coordinated loading |

## When to Use Nested Suspense

**Use nested Suspense with `suspensible`** when:
- Different page sections should show their own loading states
- You want granular control over which parts show loading indicators
- Sections can load at different speeds and should update independently

**Avoid nested Suspense** when:
- A single loading state for the whole component is sufficient
- The complexity isn't worth the UX benefit
- You're targeting Vue versions before 3.3

## Key Points

1. Always add `suspensible` prop when nesting Suspense components
2. Without `suspensible`, expect empty nodes and multiple patching cycles
3. This feature requires Vue 3.3 or later
4. Use nested Suspense boundaries strategically for better UX, not everywhere
5. Each Suspense can have its own fallback for section-specific loading states

## References

- [Vue.js Suspense Nested Documentation](https://vuejs.org/guide/built-ins/suspense#nested-suspense)
