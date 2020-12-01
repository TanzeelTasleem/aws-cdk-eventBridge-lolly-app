import React from "react"
import PropTypes from "prop-types"
import Header from "./header/header"

const Layout = ({ children }) => {
  return (
    <>
      <Header title="virtual lollipop" subTitle="because we all know someone who deserves some sugar."/>
      <div>
        <div>{children}</div>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
