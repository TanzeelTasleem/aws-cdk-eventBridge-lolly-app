import React from "react"
import {navigate} from 'gatsby'
import Layout from "../components/layout"
import SEO from "../components/seo"
import Lolly from "../components/svg/svg"
import styles from './index.module.css'
const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <div className={styles.lollyContainer}>
    <div className={styles.lollyWrapper}>
      <Lolly fillLollyTop ="#f54c6b" fillLollyMiddle ="red" fillLollyBottom="#6e2633"/>
      <Lolly fillLollyTop ="white" fillLollyMiddle ="#18cc48" fillLollyBottom="yellow"/>
      <Lolly fillLollyTop ="#17fff0" fillLollyMiddle ="#1fb5ab" fillLollyBottom="#178a82"/>
      <Lolly fillLollyTop ="#7885fa" fillLollyMiddle ="#3d4abf" fillLollyBottom="#2c347d"/>
      <Lolly fillLollyTop ="#d472e8" fillLollyMiddle ="pink" fillLollyBottom="#790391"/>
    </div>
     <button onClick={()=>{navigate("/createLolly")}} className={styles.lollyBtn}>make a new lolly to send a friend</button>
    </div>
    
  </Layout>
)

export default IndexPage
