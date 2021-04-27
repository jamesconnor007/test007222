import React from 'react'
import ReactDOM from 'react-dom'
import { ReactXRAware } from 'troika-xr'
import HtmlOverlays from './html-overlays/HtmlOverlaysExample'
import UIExample from './ui2/UIExample'

import 'react-dat-gui/dist/index.css'
import './index.css'


const EXAMPLES = [
  { id: 'ui', name: 'User Interface', component: UIExample },
]

class ExamplesApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedExampleId: (location.hash && location.hash.replace(/^#/, '')) || EXAMPLES[0].id,
      bodyWidth: null,
      bodyHeight: null,
      stats: true
    }
    this._onBodyElRef = this._onBodyElRef.bind(this)
    this._onWindowResize = this._onWindowResize.bind(this)
    this._onHashChange = this._onHashChange.bind(this)
    this._onExampleSelect = this._onExampleSelect.bind(this)
    this._onToggleStats = this._onToggleStats.bind(this)
  }
  componentWillMount() {
    window.addEventListener('hashchange', this._onHashChange, false)
    window.addEventListener('resize', this._onWindowResize, false)
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this._onHashChange, false)
    window.removeEventListener('resize', this._onWindowResize, false)
  }

  _onBodyElRef(el) {
    this._bodyEl = el
    if (el) {
      this._onWindowResize()
    }
  }

  _onWindowResize() {
    let box = this._bodyEl.getBoundingClientRect()
    this.setState({ bodyWidth: box.width, bodyHeight: box.height })
  }

  _onHashChange() {
    const selectedExampleId = location.hash.replace(/^#/, '')
    const exampleObj = EXAMPLES.filter(({ id }) => id === selectedExampleId)[0]
    if (exampleObj) {
      if (exampleObj.disableXR && this.props.xrSession) {
        this.props.xrSession.end().then(() => {
          this.setState({ selectedExampleId })
        })
      } else {
        this.setState({ selectedExampleId })
      }
    }
  }

  _onExampleSelect(e) {
    location.hash = e.target.value
  }

  _onToggleStats() {
    this.setState({ stats: !this.state.stats })
  }

  render() {
    let { selectedExampleId, bodyWidth, bodyHeight, stats } = this.state
    let example = EXAMPLES.filter(({ id }) => id === 'ui')[0]
    let ExampleCmp = example && example.component

    return (
      <div className="examples">
        <section className="examples_body" ref={this._onBodyElRef}>
          {ExampleCmp ?
            (bodyWidth && bodyHeight ? <ExampleCmp
              width={bodyWidth}
              height={bodyHeight}
              vr={!!this.props.xrSession && !example.disableXR}
            /> : null) :
            `Unknown example: ${selectedExampleId}`
          }
          <div id="react-dat-gui-portal"></div>
        </section>
      </div>
    )
  }
}

ExamplesApp = ReactXRAware(ExamplesApp, {
  // For now, none of the examples make use of floor-relative tracking, so let's just
  // limit it to a 'local' space to make it easier to keep things at eye height.
  // TODO: figure out a good approach for floor-relative tracking for any future
  //  examples that make use of it.
  referenceSpaces: ['local']
})

ReactDOM.render(<ExamplesApp />, document.getElementById('app'))
