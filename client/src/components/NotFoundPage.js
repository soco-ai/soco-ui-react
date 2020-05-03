import React from 'react';
import {Result} from 'antd';

const NotFoundPage = () => (
    <div
      style={{
        display: "flex", fontSize: "30px", justifyContent: "center",
        padding: "20px", width: "100%"
      }} 
    >
      <Result
        status="warning" title="404" subTitle={<div style={{fontSize: "20px"}}>Sorry. The page you visited does not exist.</div>}
      />
    </div>
);

export default NotFoundPage;
