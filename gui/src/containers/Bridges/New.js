import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-static'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import PaddedCard from 'components/PaddedCard'
import Typography from '@material-ui/core/Typography'
import Breadcrumb from 'components/Breadcrumb'
import BreadcrumbItem from 'components/BreadcrumbItem'
import Form from 'components/Bridges/Form'
import { createBridge } from 'actions'
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

const SuccessNotification = ({name}) => (<React.Fragment>
  Successfully created bridge <Link to={`/bridges/${name}`}>{name}</Link>
</React.Fragment>)

const ErrorNotification = ({name}) => (
  <React.Fragment>Error creating bridge {name}</React.Fragment>
)

const New = props => (
  <React.Fragment>
    <Breadcrumb className={props.classes.breadcrumb}>
      <BreadcrumbItem href='/'>Dashboard</BreadcrumbItem>
      <BreadcrumbItem>></BreadcrumbItem>
      <BreadcrumbItem href='/bridges'>Bridges</BreadcrumbItem>
      <BreadcrumbItem>></BreadcrumbItem>
      <BreadcrumbItem>New</BreadcrumbItem>
    </Breadcrumb>
    <Typography variant='display2' color='inherit' className={props.classes.title}>
      New Bridge
    </Typography>

    <Grid container spacing={40}>
      <Grid item xs={12}>
        <PaddedCard>
          <Form
            actionText='Create Bridge'
            onSubmit={props.createBridge}
            onSuccess={SuccessNotification}
            onError={ErrorNotification}
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
  matchRouteAndMapDispatchToProps({createBridge})
)(New)

export default withStyles(styles)(ConnectedNew)
