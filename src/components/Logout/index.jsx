import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

export default function Logout({ logout }) {
  logout();
  return <Redirect to="/login" />;
}

Logout.propTypes = {
  logout: PropTypes.func.isRequired,
};
