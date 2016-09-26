import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export default (element, customOptions) => {
  const deps = [];
  const defaultOptions = {
    maxPasses: Infinity
  };
  const options = { ...defaultOptions, ...customOptions };

  class AsyncProvider extends React.Component {
    static propTypes = {
      children: React.PropTypes.node
    };
    static childContextTypes = {
      addDep: React.PropTypes.func
    };

    addDep({ callActions, factoryRef }) {
      const promisesResolved = deps
        .map(p => p.factoryRef)
        .find(ref => ref === factoryRef);

      if (!promisesResolved) {
        deps.push({
          promise: callActions(),
          factoryRef
        });
      }
    }

    getChildContext() {
      return { addDep: p => this.addDep(p) };
    }

    render() {
      return this.props.children;
    }
  }

  const elem = (
    <AsyncProvider>
      {element}
    </AsyncProvider>
  );

  const renderPass = (prevPromisesCount = 0, passCount = 0) => {
    const results = {
      passes: passCount
    };

    if (passCount >= options.maxPasses) {
      return Promise.resolve(results);
    } else {
      renderToStaticMarkup(elem);
      const currPromisesCount = deps.length;
      const promise = Promise.all(deps.map(p => p.promise));

      if (currPromisesCount > prevPromisesCount) {
        return promise.then(() => renderPass(currPromisesCount, passCount + 1));
      } else {
        return promise.then(() => results);
      }
    }
  };

  return renderPass();
};
