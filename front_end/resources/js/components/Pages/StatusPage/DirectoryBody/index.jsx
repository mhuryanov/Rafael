/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/forbid-prop-types */

import React from 'react'
import { Suspense, lazy, useState } from 'react';
import { IoIosFolder } from 'react-icons/io';
import { Spinner, Form } from 'react-bootstrap';
const DirectoryTree = lazy(() => import('./DirectoryTree'));
const Menu = lazy(() => import('react-burger-menu/lib/menus/push'))

import 'rc-tree/assets/index.css'
const DirectoryBody = () => {
  return <Suspense fallback={<Spinner animation="grow" variant="info" />}>
    <div className="directory-body">
      <DirectoryTree includeDeleted={true} />
    </div>
  </Suspense>

}

export default React.memo(DirectoryBody)
