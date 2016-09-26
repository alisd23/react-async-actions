import React, { Component, PropTypes } from 'react';

export default (stateToActions) => (MyComponent) => {
  return class extends Component {
    static contextTypes = {
      addDep: PropTypes.func
    }
    static displayname = 'FireActions';
    asyncRender = Boolean(this.context.addDep);

    fireActions() {
      const actions = stateToActions(this.props);
      return Promise.all(
        actions.filter(val => val && val.then)
      );
    };

    // ONLY run on server when AsyncProvider is used
    componentWillMount() {
      if (this.asyncRender) {
        this.context.addDep({
          callActions: () => this.fireActions(),
          factoryRef: stateToActions
        });
      }
    }

    // Doesn't run on server
    componentDidMount() {
      this.fireActions();
    }

    render() {
      return (
        <MyComponent {...this.props} />
      );
    }
  };
};
