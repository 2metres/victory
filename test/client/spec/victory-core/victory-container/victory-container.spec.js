/**
 * Client tests
 */
/* global sinon */
/*eslint-disable max-nested-callbacks */
/* eslint no-unused-expressions: 0 */

import React from "react";
import { shallow, mount } from "enzyme";
import VictoryContainer from "packages/victory-core/src/victory-container/victory-container";

describe("components/victory-container", () => {
  it("renders an svg with a role of img", () => {
    const wrapper = shallow(<VictoryContainer />);
    const output = wrapper.find("svg").at(0);
    expect(output.prop("role")).to.contain("img");
  });

  it("renders an svg with a custom role", () => {
    const wrapper = shallow(<VictoryContainer role="presentation" />);
    const output = wrapper.find("svg").at(0);
    expect(output.prop("role")).to.contain("presentation");
  });

  it("renders an svg with a title node", () => {
    const wrapper = shallow(<VictoryContainer title="Victory Chart" />);
    const output = wrapper.find("title");
    expect(output.html()).to.contain("Victory Chart");
  });

  it("renders an svg with a desc node", () => {
    const wrapper = shallow(<VictoryContainer desc="description" />);
    const output = wrapper.find("desc");
    expect(output.html()).to.contain("description");
  });

  it("renders an svg with an aria-describedby attribute", () => {
    const wrapper = shallow(
      <VictoryContainer aria-describedby="testid" desc="description" />
    );
    const describedElement = wrapper.find(`[aria-describedby~="testid"]`).at(0);
    expect(describedElement.type()).to.equal("svg");
  });

  it("renders an svg with an aria-labelledby attribute", () => {
    const wrapper = shallow(
      <VictoryContainer aria-labelledby="testid" title="title" />
    );
    const describedElement = wrapper.find(`[aria-labelledby~="testid"]`).at(0);
    expect(describedElement.type()).to.equal("svg");
  });

  it("renders an svg with the correct viewbox", () => {
    const width = 300;
    const height = 300;
    const wrapper = shallow(<VictoryContainer width={width} height={height} />);
    const svg = wrapper.find("svg").at(0);
    const viewBoxValue = `0 0 ${width} ${height}`;
    expect(svg.prop("viewBox")).to.equal(viewBoxValue);
  });

  it("attaches an event to the container", () => {
    const clickHandler = sinon.spy();
    const wrapper = mount(
      <VictoryContainer events={{ onClick: clickHandler }} />
    );
    const svg = wrapper.find("svg").at(0);
    svg.simulate("click");
    expect(clickHandler).called;
  });
});
