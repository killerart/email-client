import { ipcRenderer } from 'electron';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { MDBAnimation, MDBInput, MDBBtn } from 'mdbreact';
import { Row, Col, Form } from 'reactstrap';
import { IpcActions } from '../lib/IpcActions';
import '../styles/Send.css';

export default function Send({ credentials, logout }) {
  const [sent, setSent] = useState();
  const [to, setTo] = useState();
  const [subject, setSubject] = useState();
  const [text, setText] = useState();

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const message = { to, subject, text };
      ipcRenderer
        .invoke(IpcActions.SEND_MESSAGE, credentials, message)
        .then(() => setSent(true))
        .catch((error) => {
          logout(error.message);
        });
    },
    [to, subject, text, credentials, logout]
  );

  const onAnimationEnd = useCallback(() => {
    setSent(false);
    setTo('');
    setSubject('');
    setText('');
  }, []);

  return (
    <MDBAnimation
      type={sent ? 'fadeOutUp' : 'fadeIn'}
      onAnimationEnd={sent ? onAnimationEnd : undefined}
    >
      <Row>
        <Col className="mt-5">
          <Form className="px-2" onSubmit={onSubmit}>
            <MDBInput
              label="To"
              type="email"
              name="to"
              validate
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <MDBInput
              label="Subject"
              type="text"
              name="subject"
              validate
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <MDBInput
              className="md-textarea"
              label="Message"
              type="textarea"
              name="text"
              validate
              outline
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <MDBBtn type="submit" color="light" block>
              Send
            </MDBBtn>
          </Form>
        </Col>
      </Row>
    </MDBAnimation>
  );
}

Send.propTypes = {
  credentials: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};
