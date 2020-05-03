import React from 'react';
import {Card, Tabs} from "antd";
import { StickyContainer, Sticky } from 'react-sticky';
import JSONPretty from 'react-json-pretty';
const {TabPane} = Tabs;

// Tab bar setting
const renderTabBar = (props, DefaultTabBar) => (
    <Sticky bottomOffset={80}>
        {({ style }) => (
            <DefaultTabBar
            {...props}
            style={{
                ...style,
                zIndex: 1,
                background: "#fff",
                height: "47px"
            }} />
        )}
    </Sticky>
);

// Code Example
class Code extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
        return (
            <Card style={{
                height: "auto", marginBottom: this.props.marginBottom || "30px", width: "100%"
            }} className="report-card report-code-card">
                <StickyContainer style={{height: "100%"}}>
                    <Tabs
                        className={"soco-code-tabs"}
                        defaultActiveKey="sql"
                        renderTabBar={renderTabBar}
                    >
                        <TabPane className={"soco-tabpane"} tab="SOCO Query" key="sql" style={{ height: "100%", overflow: "scroll"}}>
                            <JSONPretty style={{ fontSize: "13px", height: "auto"}} id="json-pretty" data={this.props.sql} />
                        </TabPane>
                    </Tabs>
                </StickyContainer>
            </Card>
        )
    }
}

export default Code;
