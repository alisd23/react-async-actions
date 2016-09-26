import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { asyncActions } from '../index';
import createMockStore from './helpers/mockStore';
import { SimpleComponent } from './helpers/components';

jest.useFakeTimers();

let store;

beforeEach(() => {
  store = createMockStore();
});

describe('client rendering', () => {
  describe('asyncActions', () => {
    it('fires off async actions', () => {
      const actionsToFire = () => [store.addFruitAsync('orange')];
      const Component = asyncActions(actionsToFire)(SimpleComponent);

      TestUtils.renderIntoDocument(
        <Component />
      );

      expect(store.addFruit.mock.calls.length).toBe(0);
      jest.runAllTimers();
      expect(store.addFruit.mock.calls.length).toBe(1);
    });
    it('fires off sync actions', () => {
      const actionsToFire = () => [store.addFruitSync('orange')];
      const Component = asyncActions(actionsToFire)(SimpleComponent);

      TestUtils.renderIntoDocument(
        <Component />
      );

      expect(store.addFruit.mock.calls.length).toBe(1);
    });
  });
});
