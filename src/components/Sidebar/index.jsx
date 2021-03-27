import React from 'react';
import PropTypes from 'prop-types';
import {
  MDBBtn,
  MDBMask,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavItem,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCardTitle,
  MDBCol,
  MDBCardText,
  MDBRow,
  MDBContainer,
  MDBView,
  MDBNavLink,
  MDBAnimation,
} from 'mdbreact';
import './index.css';
import { ipcRenderer } from 'electron';
import Loader from 'react-loader-spinner';
import { withRouter } from 'react-router';
import { Actions } from '../../utils/ipcCommunication';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: undefined,
    };
  }

  componentDidMount() {
    const { credentials } = this.props;
    ipcRenderer
      .invoke(Actions.GET_ALL_MESSAGES, credentials)
      .then((parsedMessages) => {
        this.setState({ messages: parsedMessages ?? [] });
      })
      .catch(this.onError);

    ipcRenderer.on(Actions.NEW_MESSAGE, this.onNewMessage);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(Actions.NEW_MESSAGE, this.onNewMessage);
  }

  onNewMessage = (event, message) => {
    const { messages } = this.state;
    messages.unshift(message);
    this.setState({ messages });
  };

  onError = (error) => {
    const { logout } = this.props;
    logout(error.message);
  };

  onMessageClick = (message) => {
    const { selectedMessageUID, setSelectedMessageUID, history } = this.props;
    if (!selectedMessageUID || selectedMessageUID !== message.UID) {
      message.flags.push('\\Seen');
      setSelectedMessageUID(message.UID);
      history.push(`/message/${message.UID}`);
    }
  };

  render() {
    const { messages } = this.state;
    const {
      credentials,
      logout,
      selectedMessageUID,
      setSelectedMessageUID,
      children,
    } = this.props;

    return (
      <>
        <div className="sidenav bg-light shadow">
          <MDBCol className="py-2 overflow-auto h-100">
            {messages ? (
              <MDBAnimation type="fadeIn">
                {messages.map((message) => (
                  <MDBRow key={message.UID} className="my-2">
                    <MDBCol>
                      <MDBView
                        hover
                        waves
                        className="card"
                        onClick={() => this.onMessageClick(message)}
                      >
                        <MDBCard>
                          <MDBCardHeader>
                            <span className="card-selectable-text">
                              From: {message.from.address}
                            </span>
                          </MDBCardHeader>
                          <MDBCardBody>
                            <MDBCardTitle>
                              <span className="card-selectable-text">
                                {message.title}
                              </span>
                            </MDBCardTitle>
                            <MDBCardText>
                              <span className="card-selectable-text">
                                {message.date.toLocaleString()}
                              </span>
                            </MDBCardText>
                          </MDBCardBody>
                        </MDBCard>
                        <MDBMask
                          overlay={
                            message.flags.includes('\\Seen') ||
                            selectedMessageUID === message.UID
                              ? 'black-slight'
                              : 'green-light'
                          }
                          className={
                            selectedMessageUID === message.UID
                              ? 'selected-mask'
                              : !message.flags.includes('\\Seen')
                              ? 'unseen-mask'
                              : ''
                          }
                        />
                      </MDBView>
                    </MDBCol>
                  </MDBRow>
                ))}
              </MDBAnimation>
            ) : (
              <Loader
                width={200}
                height={200}
                radius={100}
                color="gray"
                type="Rings"
                className="absolute-center"
              />
            )}
          </MDBCol>
        </div>

        <div className="page-content">
          <MDBNavbar expand className="absolute-navbar bg-light">
            <MDBNavbarNav className="align-items-center">
              <MDBNavItem>{credentials.email}</MDBNavItem>
              <MDBNavItem>
                <MDBNavLink
                  to="/send"
                  className="btn btn-light btn-sm"
                  role="button"
                  onClick={() => setSelectedMessageUID(undefined)}
                >
                  New email
                </MDBNavLink>
              </MDBNavItem>
              <MDBNavItem>
                <MDBBtn
                  className="btn btn-light btn-sm"
                  onClick={() => logout()}
                >
                  Logout
                </MDBBtn>
              </MDBNavItem>
            </MDBNavbarNav>
          </MDBNavbar>

          <MDBContainer className="h-100 bg-white">{children}</MDBContainer>
        </div>
      </>
    );
  }
}

Sidebar.propTypes = {
  credentials: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  selectedMessageUID: PropTypes.number,
  setSelectedMessageUID: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(Sidebar);
