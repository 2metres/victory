import React from "react";
import PropTypes from "prop-types";

class VictoryAccessibleGroup extends React.Component {
  static displayName = "VictoryAccessibleGroup";
  static propTypes = {
    "aria-describedby": PropTypes.string,
    "aria-label": PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    className: PropTypes.string,
    desc: PropTypes.string,
    tabIndex: PropTypes.number
  };

  static defaultProps = {
    className: "VictoryAccessibleGroup"
  };

  render() {
    const { desc, children, className, tabIndex } = this.props;
    const descId =
      desc && (this.props["aria-describedby"] || desc.split(" ").join("-"));

    return desc ? (
      <g
        aria-label={this.props["aria-label"]}
        aria-describedby={descId}
        className={className}
        tabIndex={tabIndex}
      >
        <desc id={descId}>{desc}</desc>
        {children}
      </g>
    ) : (
      <g
        aria-label={this.props["aria-label"]}
        aria-describedby={this.props["aria-describedby"]}
        className={className}
        tabIndex={tabIndex}
      >
        {children}
      </g>
    );
  }
}

export default VictoryAccessibleGroup;
