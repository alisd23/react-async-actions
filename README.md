# react-async-actions

A simple way to handle asynchronous action dependencies in React components, in apps which use a global state container (e.g. Redux/Mobx/Flux), on **client** and **server**.

This library attempts to be as non-obtrusive as possible, providing a simple helper function for server-rendering, to allow the server to wait for all async actions to resolve before calling `renderToString`, and a decorator to use on components which depend on *actions*.

- [Should I use this library?](#should-i-use-this-library)
- [The Problem](#the-problem)
- [Client-side](#client-side)
- [Server-side](#server-side)
- [How it works](#how-it-works)
  - [On the client](#on-the-client)
  - [On the server](#on-the-server)
- [Installing](#installing)
- [Usage](#usage)
- [API](#api)

## Should I use this library?

You might want to use this library if your app:

1. Renders React on the **server** (is *isomorphic/universal)
2. Has components with **async data dependencies** *(e.g. component 'A' depends on some data from an API call before rendering content)*.
3. Uses some **global state container** (Redux, Mobx, Flux) - *i.e. your application data's source of truth is **not** stored in component state*

## The Problem

In React, it's very common for components to depend on some data from **async actions** before they can render.

> Just to clarify, an **action** here is a fairly generic construct, not to be confused with a [Redux](http://redux.js.org/docs/basics/Actions.html) action, which is just an object. It's more comparible to a [MobX](https://mobxjs.github.io/mobx/refguide/action.html) action - i.e. some function that sometimes fetches some data, and then sets some state, which React then uses to render component(s).

*Actions* can be asynchronous, *OR* synchronous. It could be a **Redux** action (creator), a **MobX** action, or any other action which sets state in a *global state container*.

## Client-side

*On the client* this can be done fairly easily because of how `React.render` works. The actions simply get fired off when the component `mounts`, state is changed somewhere, and the app can keep re-rendering as state changes. 


## Server-side

However *on the server* the rendering scenario is completely different. The server needs to render **only once** to a `string`, then send that markup to the client as soon as possible.

So when a component needs to wait for some data from an *async action*, out of the box `ReactDOM.renderToString` will render the whole app to a html string, firing off any actions you might have in `componentWillMount`, then when the actions complete and modify the state, there's nothing to cause another re-render. Usually this can be solved by either:

- Manually fetching any data for each `route` on the server before rendering, which can be hard to maintain.
- Sending incomplete markup back to the client and leting the client fetch the data. But this complete removes the point of isomorphic/universal rendering.

This library attempts to solve this problem in a fairly simple way. By listing your action dependencies for each component explicitly, and returning `promises` from any async actions, we can watch and wait for those `promises` to resolve on the server (only promises are supported at the moment).


## How it works

### On the client

As i mentioned above - the actions simply get fired off on `componentDidMount`. It's up to you to handle any loading states - no props are passed down to your component.

### On the server

We call `ReactDOM.renderToStaticMarkup` to reliably work out which actions need to fire. Because it actually renders the app - it runs `componentWillMount` on the right components.

When the actions have been resolved and the state has been set, you can simply call `ReactDOM.renderToString` and send the resulting markup back to the client.

In most situations it would only take **1 render pass** to resolve all promises in your app. If you know how many passes it should take then you can set that via the `maxPasses` property. So a common case would be `maxPasses: 1`

Each components' actions get fired **only once**, although it *may* take multiple *render passes* to fire off all actions if there are **chains** of async dependencies.

An async dependency chain is described by the following scenario:

`Component A`

- Depends on on API call, then renders `Component B` when data is available

`Component B`

- Only renders when `Component A`'s action has resolved.
- Depends on a different API call.
- Now depends on a *chain* of 2 API calls; first `Component A`'s, then its own.

This would take **2/3 passes** to guarantee all promises have been resolved.
- **1st pass** renders `A` and fires off its actions.
- **2nd pass** renders `A` and `B`, skipping `A`'s actions (as they have already been fired), and fires off `B`'s actions.
- **3rd pass** (if `maxPasses` has not been set) renders `A` and `B` to check no other components with async dependencies have been rendered.

How many passes your app needs to render is completely down to design. It's best to avoid these **chains** of async dependencies where possible, as it increases loading time on both client server. This could be done by defining all action dependencies at the `Route Component` level for example.


## Installing

`npm install react-async-actions --save`


## Usage

`UserComponent.js`

```js
import { asyncActions } from 'react-async-actions';

const actionsToFire = (props) => [
  props.getUser(props.id)
];

@asyncActions(actionsToFire)
class User extends Component {
  // ...
}

// OR

asyncActions(actionsToFire)(User);
```

`server.js`

```js
import { fireActions } from 'react-async-actions';
// import { Provider } from 'react-redux';
// import { Provider } from 'mobx-react';

const element = (
  <Provider {stores}>
    <App />
  </Provider>
);

const options = {
  maxPasses: 1
};

fireAsyncActions(element, options)
  .then(() => {
    // Promises will be resolved at this point, store will be up to date
    // Now can do one final render to generate the full markup from the initialised state
    const markup = renderToString(element);

    sendToClient(markup);
  })
```

## API

### asyncActions(*mapPropsToActions*)

Component decorator, takes in a function with a `props` parameter.  

- **mapPropsToActions(props)** - should return an array of actions (not to be confused with a Redux action object). These 'actions' can be whatever you want, *synchronous* or *asynchronous*, as long as the async actions return a promise, so we know when the action has resolved.

### fireAsyncActions(*element* [, *options*])

- **element** - React element to resolve actions for (usually the root)
- **options** - Options object with the the following properties
  * **maxPasses** *optional* - limits the number of render passes. **Recommended** if you know how many passes it should take to fire all your actions. E.g. if you have *no* async dependency **chains** (described above) but you do have async actions, set this to **1**.
  `default: Inifinity`

---

## License

MIT
