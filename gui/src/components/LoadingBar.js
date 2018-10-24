import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 3,
    overflow: 'hidden'
  },
  colorPrimary: {
    backgroundColor: theme.palette.background.default
  },
  barColorPrimary: {
    backgroundColor: theme.palette.primary.main
  }
})

class LoadingBar extends Component {
  state = {
    completed: 0
  };

  componentDidMount () {
    this.timer = setInterval(this.progress, 500)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  progress = () => {
    const { completed } = this.state
    if (completed === 100) {
      this.setState({ completed: 0 })
    } else {
      const diff = Math.random() * 10
      this.setState({ completed: Math.min(completed + diff, 100) })
    }
  };

  render () {
    const progressClasses = {
      colorPrimary: this.props.classes.colorPrimary,
      barColorPrimary: this.props.classes.barColorPrimary
    }

    return (
      <div className={this.props.classes.root}>
        {this.props.fetchCount > 0 &&
          <LinearProgress
            variant='indeterminate'
            classes={progressClasses}
          />}
      </div>
    )
  }
}

LoadingBar.propTypes = {
  classes: PropTypes.object.isRequired,
  fetchCount: PropTypes.number.isRequired
}

export default withStyles(styles)(LoadingBar)
