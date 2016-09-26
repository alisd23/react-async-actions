# react-async-actions

A simple way to handle asynchronous dependencies in React components in apps which use a global state container (e.g. Redux/Mobx/Flux), on client and server.

This library attempts to be as non-obtrusive as possible, providing a simple helper function for server-rendering, and a decorator to use on components which depend on *actions* which return promise (if asynchronous).

## Can I use this library?

You might want to use this library if your app:
1. renders React on the server
2. has components with async data dependencies *(e.g. component 'A' depends on some data from an API call before rendering content)*.
3. uses some global state container (Redux, Mobx, Flux) - i.e. your application data's source of truth is *not** stored in component state

## Description

In React, it's very common for components to depend on some data from **async actions** before they can render. Just to clarify, an *action* here is a fairly generic construct - i.e. some code that fetches some data, and usually sets some state, which React then uses to render component(s). It could be a *Redux* action, a *MobX* action or any other action which sets state in a *global state container*.

*On the client* this can be done fairly easily, as the app just receives the data, state is changed somewhere, and the app re-renders. However *on the server* the rendering scenario is completely different. The server needs to render **only once** to a `string`, then send that markup to the client as soon as possible.

So when a component needs to wait for some data from an *async action*, out of the box `ReactDOM.renderToString` will render the whole app to a html string, firing off any actions you might have in `componentWillMount`, then when the actions complete and modify the state, there's nothing to cause another re-render, so usually you just have to manually fetch any data for each `route` before rendering, or just send incomplete markup back to the client

This library attempts to solve this problem in a fairly simple way. By listing your action dependencies for each component explicitly, and returning `promises` from any async actions, we can watch and wait for those `promises` to resolve (Only promises are supported at the moment).

### On the client

The actions simply get fired off when the component `mounts`. It's up to you to handle loading states, etc...


### On the server

A components' actions get fired **only once**, although it may take multiple *render passes* to fire off **all actions** if there are *chains* of async dependencies,

An async dependency chain is described by the following scenario:

`Component A`
⋅⋅⋅depends on on API call, then renders `Component B` when data is available
`Component B`
⋅⋅⋅depends on a different API call

`Component B` now depends on a *chain* of 2 API calls; first `Component A`'s, then its own.

This would take **2 passes** to guarantee all promises have been resolved.
- **1st pass** renders `A` and fires off its actions.
- **2nd pass** renders `A` and `B`, skipping `A`'s actions (as they have already been fired), and fires off `B`'s actions.
- **3rd pass** (if maxPasses has not been set) renders `A` and `B` to check no other components with async dependencies have been rendered.


## Installing

`npm install react-async-actions`

## Usage

`UserComponent.js`

```js
import { asyncActions } from 'react-async-actions';

// Returns array of sync/async actions
const actionsToFire = (props) => [
  getUser(props.id)
];

@asyncActions(actionsToFire)
class User extends Component {
  // ...
}

// OR

asyncActions(actionsToFire)(User);
```

### API

#### asyncActions(*mapPropsToActions*)

Component decorator, takes in a function with a `props` parameter.  
Should return an array of actions, which can be *synchronous* or *asynchronous* (by returning a promise).

#### fireAsyncActions(*element* [, *options*])

Options is an object with the following *optional* properties

- maxPasses
