import { gql, useQuery } from "@apollo/client"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import ShowLolly from "../components/showLolly/showLolly"

export const getLollyByPath = gql`
  query getLolly($path: String!) {
    getLolly(lollyPath: $path) {
      senderName
      recipient
      msg
      lollyTop
      lollyMid
      lollyBotm
      lollyPath
    }
  }
`
const NotFoundPage = ({ location }) => {
  const id = location.href ? location.pathname.replace("/", "") : ""
  const { loading, data, error } = useQuery(getLollyByPath, {
    variables: { path: id },
  })
  return (
    <Layout>
      <SEO title="404: Not found" />
      {loading && <h1>Loading Data ...</h1>}
      {data && <ShowLolly data={data.getLolly} location={location.href} />}
      {error && <h1>Not Found ...</h1>}
    </Layout>
  )
}

export default NotFoundPage
