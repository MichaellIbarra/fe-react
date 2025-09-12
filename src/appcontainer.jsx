/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
// import config from "config"; // Comentado porque no se usa y el módulo no existe

import { Route, Redirect, BrowserRouter as Router, Routes } from "react-router-dom";
// import Header from "./components/header";
import Login from "./components/pages/login";


const AppContainer = function (props) {


  return (
    <Router basename= "/">
      <>
        {/* <Route render={(props) => <Header {...props} />} /> */}
        <Routes>
          {/* <Route index element={<Login />} /> */}
          <Route  path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        {/* <Route render={(props) => <Footer {...props} />} /> */}
      </>
    </Router>
  );
};

export default AppContainer;
