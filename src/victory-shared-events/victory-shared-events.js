import { assign, isFunction, partialRight, defaults, keys } from "lodash";
import React, { PropTypes } from "react";
import { PropTypes as CustomPropTypes, Events, Timer } from "../victory-util/index";

export default class VictorySharedEvents extends React.Component {
  static displayName = "VictorySharedEvents";

  static role = "shared-event-wrapper";

  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ]),
    container: React.PropTypes.node,
    groupComponent: React.PropTypes.node,
    events: PropTypes.arrayOf(PropTypes.shape({
      childName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
      target: PropTypes.string,
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    eventKey: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ])
  };

  static defaultProps = {
    groupComponent: <g/>
  };

  static contextTypes = {
    getTimer: React.PropTypes.func
  };

  static childContextTypes = {
    getTimer: React.PropTypes.func
  };

  constructor() {
    super();
    this.state = this.state || {};
    this.getScopedEvents = Events.getScopedEvents.bind(this);
    this.getEventState = Events.getEventState.bind(this);
    this.getTimer = this.getTimer.bind(this);
  }

  getChildContext() {
    return {
      getTimer: this.getTimer
    };
  }

  getTimer() {
    if (this.context.getTimer) {
      return this.context.getTimer();
    }
    if (!this.timer) {
      this.timer = new Timer();
    }
    return this.timer;
  }

  componentWillMount() {
    this.setUpChildren(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.setUpChildren(newProps);
  }

  getAllEvents(props) {
    const components = ["container", "groupComponent"];
    this.componentEvents = Events.getComponentEvents(props, components);
    if (Array.isArray(this.componentEvents)) {
      return Array.isArray(props.events) ?
        this.componentEvents.concat(...props.events) : this.componentEvents;
    }
    return props.events;
  }

  setUpChildren(props) {
    this.events = this.getAllEvents(props);
    if (this.events) {
      this.childComponents = React.Children.toArray(props.children);
      const childBaseProps = this.getBasePropsFromChildren(this.childComponents);
      const parentBaseProps = props.container ? props.container.props : {};
      this.baseProps = assign({}, childBaseProps, {parent: parentBaseProps});
    }
  }

  getBasePropsFromChildren(childComponents) {
    const getBaseProps = (children, childIndex, parent) => {
      return children.reduce((memo, child, index) => {
        if (child.props && child.props.children) {
          const nestedChildren = React.Children.toArray(child.props.children);
          const nestedProps = getBaseProps(nestedChildren, index, child);
          keys(nestedProps).map((key) => {
            memo[key] = nestedProps[key];
          });
        } else if (child.type && isFunction(child.type.getBaseProps)) {
          child = parent ? React.cloneElement(child, parent.props) : child;
          const baseChildProps = child.props && child.type.getBaseProps(child.props);
          if (baseChildProps) {
            const key = childIndex ? `${childIndex}-${index}` : index;
            const childKey = child.props.name || key;
            memo[childKey] = baseChildProps;
          }
        }
        return memo;
      }, {});
    };
    return getBaseProps(childComponents);

  }

  getNewChildren(props) {
    const {events, eventKey} = props;
    const childNames = Object.keys(this.baseProps);
    const alterChildren = (children) => {
      return children.reduce((memo, child, index) => {
        if (child.type && isFunction(child.type.getBaseProps)) {
          const name = child.props.name || childNames.shift() || index;
          const childEvents = Array.isArray(events) &&
            events.filter((event) => {
              if (event.target === "parent") {
                return false;
              }
              return Array.isArray(event.childName) ?
                event.childName.indexOf(name) > -1 :
                event.childName === name || event.childName === "all";
            });
          const sharedEvents = {
            events: childEvents,
            getEvents: partialRight(this.getScopedEvents, name, this.baseProps),
            getEventState: partialRight(this.getEventState, name)
          };
          return memo.concat(React.cloneElement(child, assign(
            { key: `events-${name}`, sharedEvents, eventKey },
            child.props
          )));
        } else if (child.props.children) {
          return memo.concat(React.cloneElement(
            child,
            child.props,
            alterChildren(React.Children.toArray(child.props.children))
          ));
        } else {
          return memo.concat(child);
        }
      }, []);
    };

    return alterChildren(this.childComponents);
  }

  getContainer(props, children) {
    const parents = Array.isArray(this.events) &&
      this.events.filter((event) => event.target === "parent");
    const sharedEvents = parents.length > 0 ?
      {
        events: parents,
        getEvents: partialRight(this.getScopedEvents, null, this.baseProps),
        getEventState: partialRight(this.getEventState, null)
      } : null;
    const container = this.props.container || this.props.groupComponent;
    const boundGetEvents = Events.getEvents.bind(this);
    const parentEvents = sharedEvents && boundGetEvents({sharedEvents}, "parent");
    const parentProps = defaults(
      {},
      this.getEventState("parent", "parent"),
      container.props,
      this.baseProps.parent,
      { children }
    );
    return React.cloneElement(
      container,
      assign(
        {}, parentProps, {events: Events.getPartialEvents(parentEvents, "parent", parentProps)}
      )
    );
  }

  render() {
    if (this.events) {
      const children = this.getNewChildren(this.props);
      return this.getContainer(this.props, children);
    }
    return React.cloneElement(this.props.container, { children: this.props.children });
  }
}
