# Steps to create a new slice

1. Create the slice in a new file
2. Add the slice to the rootReducer in store.js
3. Create and add its setState reducer to the importState thunk in Thunks.js, so 
the slice's state is set when a new state is imported from the Settings Screen
4. Export its reducers and selectors in the index.js file