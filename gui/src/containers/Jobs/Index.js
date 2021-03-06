import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import JobList from 'components/JobList'
import ReactStaticLinkComponent from 'components/ReactStaticLinkComponent'
import matchRouteAndMapDispatchToProps from 'utils/matchRouteAndMapDispatchToProps'
import jobsSelector from 'selectors/jobs'
import { fetchJobs } from 'actions'

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  }
})

const renderJobsList = props => {
  const { jobs, jobCount, pageSize, jobsError, fetchJobs, history, match } = props
  return (
    <JobList
      jobs={jobs}
      jobCount={jobCount}
      pageSize={pageSize}
      error={jobsError}
      fetchJobs={fetchJobs}
      history={history}
      match={match}
    />
  )
}

export class Index extends Component {
  render () {
    return (
      <div>
        <Grid container alignItems='center' >
          <Grid item xs={9}>
            <Typography variant='display2' color='inherit' className={this.props.classes.title}>
              Jobs
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify='flex-end' >
              <Grid item>
                <Button variant='outlined' color='primary' component={ReactStaticLinkComponent} to={'/jobs/new'}>
                  New Job
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {renderJobsList(this.props)}
          </Grid>
        </Grid>
      </div>
    )
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  ethBalance: PropTypes.string,
  linkBalance: PropTypes.string,
  accountBalanceError: PropTypes.string,
  jobCount: PropTypes.number.isRequired,
  jobs: PropTypes.array.isRequired,
  jobsError: PropTypes.string,
  pageSize: PropTypes.number
}

Index.defaultProps = {
  pageSize: 10
}

const mapStateToProps = state => {
  let accountBalanceError
  if (state.accountBalance.networkError) {
    accountBalanceError = 'error fetching balance'
  }
  let jobsError
  if (state.jobs.networkError) {
    jobsError = 'There was an error fetching the jobs. Please reload the page.'
  }

  return {
    ethBalance: state.accountBalance.eth,
    linkBalance: state.accountBalance.link,
    accountBalanceError: accountBalanceError,
    jobCount: state.jobs.count,
    jobs: jobsSelector(state),
    jobsError: jobsError
  }
}

export const ConnectedIndex = connect(
  mapStateToProps,
  matchRouteAndMapDispatchToProps({fetchJobs})
)(Index)

export default withStyles(styles)(ConnectedIndex)
