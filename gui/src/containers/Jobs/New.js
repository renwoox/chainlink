import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-static'
import { withStyles } from '@material-ui/core/styles'
import Breadcrumb from 'components/Breadcrumb'
import BreadcrumbItem from 'components/BreadcrumbItem'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import PaddedCard from 'components/PaddedCard'
import Form from 'components/Jobs/Form'
import { createJobSpec } from 'actions'
import matchRouteAndMapDispatchToProps from 'utils/matchRouteAndMapDispatchToProps'

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  },
  breadcrumb: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  }
})

const SuccessNotification = ({data}) => (
  <React.Fragment>
    Successfully created job <Link to={`/job_specs/${data.id}`}>{data.id}</Link>
  </React.Fragment>
)

const ErrorNotification = () => (
  <React.Fragment>Error creating job</React.Fragment>
)

const New = props => (
  <React.Fragment>
    <Breadcrumb className={props.classes.breadcrumb}>
      <BreadcrumbItem href='/'>Dashboard</BreadcrumbItem>
      <BreadcrumbItem>></BreadcrumbItem>
      <BreadcrumbItem href='/jobs'>Jobs</BreadcrumbItem>
      <BreadcrumbItem>></BreadcrumbItem>
      <BreadcrumbItem>New</BreadcrumbItem>
    </Breadcrumb>
    <Typography variant='display2' color='inherit' className={props.classes.title}>
      New Job
    </Typography>

    <Grid container spacing={40}>
      <Grid item xs={12}>
        <PaddedCard>
          <Form
            actionText='Create Bridge'
            onSubmit={props.createJobSpec}
            onSuccess={SuccessNotification}
            onError={ErrorNotification}
            {...(props.location && props.location.state)}
          />
        </PaddedCard>
      </Grid>
    </Grid>
  </React.Fragment>
)

New.propTypes = {
  classes: PropTypes.object.isRequired
}

export const ConnectedNew = connect(
  null,
  matchRouteAndMapDispatchToProps({createJobSpec})
)(New)

export default withStyles(styles)(ConnectedNew)
