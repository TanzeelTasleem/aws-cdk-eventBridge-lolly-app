import React from "react"
import Lolly from "../svg/svg"
import styles from "./showLolly.module.css"
interface Props {
  data: {
    senderName: string
    recipient: string
    msg: string
    lollyTop: string
    lollyMid: string
    lollyBotm: string
    lollyPath: string
  }
  location: string
}
const ShowLolly: React.FC<Props> = ({ data, location }) => {
  console.log(location)
  return (
    <div className={styles.container}>
      <Lolly
        fillLollyTop={data.lollyTop}
        fillLollyBottom={data.lollyBotm}
        fillLollyMiddle={data.lollyMid}
      />
      <div className={styles.box}>
        <p className={styles.details}>
          Your lolly is freezing. Share it with this link
        </p>
        <div className={styles.linkBox}>
          <p className={styles.link}>{location}</p>
        </div>
        <div className={styles.detailBox}>
          <p className={styles.details}>{data.senderName}</p>
          <p
            className={styles.details}
            style={{ fontFamily: "monospace", fontSize: "20px" }}
          >
            {data.msg}
          </p>
          <p className={styles.details}>{data.recipient}</p>
        </div>
      </div>
    </div>
  )
}
export default ShowLolly
