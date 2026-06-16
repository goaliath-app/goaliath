# Steps to create a new slice

1. Create the slice in a new file
2. Add the slice to the rootReducer in store.js
3. Create and add its setState reducer to the importState thunk in Thunks.js, so 
the slice's state is set when a new state is imported from the Settings Screen
4. Export its reducers and selectors in the index.js file

# Why(s)

## Why do you assign the value of entityAdapter mutators to the state? It is not necessary.

For example in

```
selectedDay.tasks = entityAdapter.addOne(selectedDay.tasks, {...task, id: selectedDay.tasks.nextId})
```

From Docs:

> Each method will check to see if the state argument is an Immer Draft or not. If it is a draft, the method will assume that it's safe to continue mutating that draft further. If it is not a draft, the method will pass the plain JS value to Immer's createNextState(), and return the immutably updated result value.

Sometimes the state we pass is an object created in the same reducer. In that case using 
```
entityAdapter.addOne(state, entity)
```
won't update the state.
```
state = entityAdapter.addOne(state, entity)
```
works in both cases, and does not change the behavior in the normal case, since entityAdapter just returns the object provided in state.
