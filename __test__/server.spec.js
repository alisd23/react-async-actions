import React from 'react';
import { asyncActions, fireAsyncActions } from '../index';
import createMockStore from './helpers/mockStore';
import { SimpleComponent } from './helpers/components';

jest.useFakeTimers();

let store;

beforeEach(() => {
  store = createMockStore();
});

describe('server rendering', () => {
  describe('fireAsyncActions', () => {
    it('waits for actions to resolve', async () => {
      const actionsToFire = () => [store.addFruitAsync('orange')];
      const Component = asyncActions(actionsToFire)(SimpleComponent);
      const options = { maxPasses: 1 };
      const promise = fireAsyncActions(<Component />, options)
        .then(results => {
          expect(store.addFruit.mock.calls[0][0]).toBe('orange');
          expect(results.passes).toBe(1);
        });

      expect(store.addFruit.mock.calls.length).toBe(0);
      jest.runAllTimers();

      await promise;
    });
    it('performs no passes when maxPasses = 0', async () => {
      const actionsToFire = () => [store.addFruitAsync('orange')];
      const Component = asyncActions(actionsToFire)(SimpleComponent);
      const options = { maxPasses: 0 };
      const promise = fireAsyncActions(<Component />, options)
        .then(results => {
          expect(store.addFruit.mock.calls.length).toBe(0);
          expect(results.passes).toBe(0);
        });

      expect(store.addFruit.mock.calls.length).toBe(0);
      jest.runAllTimers();

      await promise;
    });
    it('can perform multiple passes of rendering if necessary', async () => {
      const parentActions = () => [store.addFruitAsync('orange')];
      const childActions = () => [store.addFruitAsync('banana')];
      const ChildComponent = asyncActions(childActions)(SimpleComponent);
      const ParentComponent = asyncActions(parentActions)(
        () => store.addFruit.mock.calls.length === 1 ? <ChildComponent /> : null
      );

      const promise = fireAsyncActions(<ParentComponent />)
        .then(results => {
          expect(store.addFruit.mock.calls.length).toBe(2);
          expect(results.passes).toBe(2);
        });

      expect(store.addFruit.mock.calls.length).toBe(0);

      jest.runAllTimers();

      // Make the next runAllTimers call async so next actions promise can
      // be resolved
      process.nextTick(() => jest.runAllTimers());

      await promise;
    });
  });
});
