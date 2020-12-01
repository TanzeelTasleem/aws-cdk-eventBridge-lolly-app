import React from "react"
import './header.css'

export interface HeaderProps {
  title: string
  subTitle: string
}

const Header: React.FC<HeaderProps> = ({ title, subTitle }) => (
  <header>
    <div className="container">
      <p className="heading">{title}</p>
      {subTitle && <p className="title">{subTitle}</p>}
    </div>
  </header>
)

export default Header
