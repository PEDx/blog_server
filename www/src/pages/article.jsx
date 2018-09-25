import React, { Component } from 'react'
import "../style/article.css"

export default class Article extends Component {
  render() {
    return (
      <div className="app-article">
        <div className="app-article-page-box">
          <div className="app-article-style">
            <h2>an excerpt from</h2>
            <h1>The Hound of the Baskervilles</h1>
            <p>Holmes stretched out his hand for the manuscript and flattened it upon his knee. &ldquo;You will observe, Watson, the alternative use of the long s and the short. It is one of several indications which enabled me to fix the date.&rdquo; At the head was written: &ldquo;Baskerville Hall,&rdquo; and below in large, scrawling figures:
              &ldquo;1742.&rdquo;</p>
            <p>&ldquo;It appears to be a statement of some sort.&rdquo;</p>
            <p>&ldquo;Yes&mdash;it is a statement of a certain legend which runs in the Baskerville family.&rdquo;</p>
            <blockquote>
              <p>Of the origin of the Hound of the Baskervilles there have been many statements, yet as I come in a direct line from Hugo Baskerville, and as I had the story from my father&hellip;</p>
            </blockquote>
            <p>When Dr. Mortimer had finished reading this singular narrative he pushed his spectacles up on his forehead and stared across at Mr. Sherlock Holmes.</p>
          </div>
        </div>
      </div>
    )
  }
}
