# react-async-actions

A simple way to handle asynchronous dependencies in React components in apps which use a global state container (e.g. Redux/Mobx/Flux), on client and server.

This library attempts to be as non-obtrusive as possible, providing a simple helper function for server-rendering, and a decorator to use on components which depend on *actions* which return promise (if asynchronous).

## Can I use this library?

You might want to use this library if your app:
1. renders on the server
2. has components with async data dependencies *(e.g. component A depends on some data from an API call before rendering content)*.
3. uses some global state container (Redux, Mobx, Flux) - i.e. your application data's source of truth is *not** stored in components

## Description

In isomorphic apps which use , it's very common for components to depend on some data from **async actions** before they can render. Just to clarify, an *action* here is a fairly generic construct - i.e. some code that fetches some data, and usually sets some state, which React then uses to render component(s). It could be a *Redux* action, a *MobX* action, or simply a `fetch` request which sets some components' state.

*On the client* this can be done fairly easily, as the app just receives the data, state is changed somewhere, and the app re-renders. However *on the server* the rendering scenario is completely different. The server needs to render **only once** to a `string`, then send that markup to the client as soon as possible. So when a component needs to wait for some data from an *async action*

## Installing

`npm install react-async-actions`

## API

asyncActions()

fireAsyncActions()

Options is an object with the following *optional* properties

- recursive

`Component A`
- depends on on API call, then renders `Component B` when data is available
`Component B`
- depends on a different API call

`Component B` now depends on a *chain* of 2 API calls; first Component A's, then its own.

This is a constraint at the moment because it would take *n* number of render passes to wait for a chain of *n* actions to resolve.
