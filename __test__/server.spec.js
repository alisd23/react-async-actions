import 'babel-polyfill';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { asyncActions, fireAsyncActions } from '../index';

const ACTION_DELAY = 50;

let store;

const asyncAction = (func) =>
  new Promise(resolve => {
    process.nextTick(() => {
      func();
      resolve();
    })
  });

const createComponent = (actionsToFire) => {
  const Component = () => <div />;
  return asyncActions(actionsToFire)(Component);
};

beforeEach(() => {
  store = {
    addFruit: jest.fn(),
    addFruitAsync(fruit) {
      return asyncAction(() => this.addFruit(fruit))
    }
  };
});

describe('server rendering', () => {
  it('fireAsyncActions waits till promises have resolved', async () => {
    const Component = createComponent(() => [store.addFruitAsync('orange')])
    const element = <Component />;
    const promise = fireAsyncActions(element)
      .then(() => {
        expect(store.addFruit.mock.calls[0][0]).toBe('orange');
      });

    expect(store.addFruit.mock.calls.length).toBe(0);

    await promise;
  });
});
