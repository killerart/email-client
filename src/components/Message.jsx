import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import { Col, Row } from 'reactstrap';
import ReactHtmlParser from 'react-html-parser';
import { MDBAnimation } from 'mdbreact';
import { IpcActions } from '../lib/IpcActions';
import '../styles/Message.css';

export default function Message({ credentials, match, logout }) {
  const [message, setMessage] = useState();

  useEffect(() => {
    const { uid } = match.params;

    ipcRenderer
      .invoke(IpcActions.GET_MESSAGE, credentials, uid)
      .then((message) => {
        if (message.html) {
          message.html = message.html.replace(
            /(="?)(\/\/)/g,
            (_, x, y) => `${x}http:${y}`
          );
        }
        setMessage(message);
      })
      .catch((error) => {
        logout(error.message);
      });
  }, [match, credentials, logout]);

  const renderMessage = useCallback(() => {
    const { html, textAsHtml, text } = message;
    if (html) {
      return (
        <iframe
          title="message"
          srcDoc={message.html}
          width="100%"
          height="100%"
          style={{ border: 0 }}
        />
      );
    }

    if (textAsHtml) {
      return <Col className="py-2">{ReactHtmlParser(message.textAsHtml)}</Col>;
    }

    return (
      <Col className="pt-2">
        <p>{text}</p>
      </Col>
    );
  }, [message]);

  return (
    <Row className="h-100">
      {message ? (
        <MDBAnimation type="fadeIn" duration="1s" className="h-100 w-100">
          {renderMessage()}
        </MDBAnimation>
      ) : (
        <Loader
          width={100}
          height={100}
          color="gray"
          type="Grid"
          className="page-absolute-center"
        />
      )}
    </Row>
  );
}

Message.propTypes = {
  credentials: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};
