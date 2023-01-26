

import React from 'react';
import { connect } from 'react-redux';
import { Container, Spinner } from 'react-bootstrap';
import { createSelectObject, createListFromSelectObject } from '../../../../../utilities/helpers'
import { Suspense, lazy } from 'react';
const CreatableSelect = lazy(() => import('react-select/creatable'));


class ItemTags extends React.Component {


  render() {

    return <Container fluid>
      <Suspense fallback={<Spinner animation="grow" variant="info" />}>
        <CreatableSelect
          isSearchable
          defaultValue={createSelectObject(this.props.tags)}
          onChange={(newValues) => { this.props.updateTags(createListFromSelectObject(newValues)) }}
          options={createSelectObject(this.props.allTags)}
          isMulti
        />
      </Suspense>
    </Container>
  }
}

const mapStateToProps = state => ({
  allTags: state.summary.allTags,

});
export default connect(
  mapStateToProps,
  {},
)(ItemTags);


