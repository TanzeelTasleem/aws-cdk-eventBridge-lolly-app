import React from 'react'
import Layout from '../components/layout'
import Lolly from '../components/svg/svg'
import styles from './lollyDetail.module.css'

const lollyDetailPage :React.FC <any> = ({pageContext}) => {
    return (
        <Layout>
            <div className={styles.container}>
            <Lolly fillLollyTop={pageContext.lolly.lollyTop} fillLollyBottom={pageContext.lolly.lollyBotm} fillLollyMiddle={pageContext.lolly.lollyMid} />
            <div className={styles.detailBox}>
                    <p className={styles.details}>{pageContext.lolly.senderName}</p>
                    <p className={styles.details} style={{fontFamily : "monospace" , fontSize:"20px"}} >{pageContext.lolly.msg}</p>
                    <p className={styles.details} >{pageContext.lolly.recipient}</p>
                </div>
            </div>
        </Layout>
    )
}

export default lollyDetailPage