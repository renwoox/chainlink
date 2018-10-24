import React, { Fragment } from 'react'
import { Link } from 'react-static'
import Flash from './Flash'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  flash: {
    textAlign: 'center'
  }
})

export class Notifications extends React.Component {
  errorPresenter = (err, i) => {
    return <p key={i}>{err.detail}</p>
  }

  successPresenter = (success, i) => {
    const isJobRun = success => success.data && success.data.type === 'runs'
    const attributes = success.data.attributes

    if (isJobRun(success)) {
      return <p key={i}>
        Job <Link to={`/job_specs/${attributes.jobId}/runs/id/${attributes.id}`}>{attributes.id}</Link> was successfully run
      </p>
    }
  }

  render () {
    const { errors, successes, classes } = this.props
    return (
      <Fragment>
        {errors.length > 0 &&
          <Flash error className={classes.flash}>
            {errors.map((err, i) => {
              if (err.type === 'component') {
                return <p key={i}>{err.component(err.props)}</p>
              }
              return this.errorPresenter(err, i)
            })}
          </Flash>
        }
        {successes.length > 0 && (
          <Flash success className={classes.flash}>
            {successes.map((succ, i) => {
              if (succ.type === 'component') {
                return <p key={i}>{succ.component(succ.props)}</p>
              }
              return this.successPresenter(succ, i)
            })}
          </Flash>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  errors: state.notifications.errors,
  successes: state.notifications.successes
})

export const ConnectedNotifications = connect(
  mapStateToProps,
  null
)(Notifications)

export default withStyles(styles)(ConnectedNotifications)
