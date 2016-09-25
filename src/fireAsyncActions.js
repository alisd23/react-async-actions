import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export default (element, options) => {
  const deps = [];
  const defaultOptions = {
    recursive: false
  };
  const { recursive } = { ...defaultOptions, ...options };

  class AsyncProvider extends React.Component {
    static propTypes = {
      children: React.PropTypes.node
    };
    static childContextTypes = {
      addDep: React.PropTypes.func
    };

    addDep({ promise, factoryRef }) {
      const promisesResolved = deps
        .map(p => p.factoryRef)
        .find(ref => ref === factoryRef);

      if (!promisesResolved) {
        deps.push({ promise, factoryRef });
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

  const renderPass = (prevPromisesCount = 0) => {
    renderToStaticMarkup(elem);
    const currPromisesCount = deps.length;
    const promise = Promise.all(deps.map(p => p.promise));

    console.log(currPromisesCount, prevPromisesCount);

    if (recursive && (currPromisesCount > prevPromisesCount)) {
      return promise.then(() => renderPass(currPromisesCount));
    } else {
      console.log('Returning');
      return promise;
    }
  };

  return renderPass();
};
