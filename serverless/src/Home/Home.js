import React, { Component } from "react";
import Axios from "axios";
import { Button } from "react-bootstrap";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      videos: []
    };
    this.getVideos = this.getVideos.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getExpiryDate() {
    const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return JSON.stringify(new Date(expiresAt));
  }

  getVideos() {
    fetch("https://xyqpjneg93.execute-api.eu-west-1.amazonaws.com/dev/videos")
      .then(res => res.json())
      .then(res => {
        if (res.files.length > 0) {
          return this.setState({
            videos: res.files,
            uploading: false
          });
        }
      })
      .catch(error => {
        if (error) console.error(error);
      });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.newUpload) {
      this.setState({ uploading: true });
      const file = this.state.newUpload[0];
      Axios.get(
        "https://xyqpjneg93.execute-api.eu-west-1.amazonaws.com/dev/s3-policy-document?filename=" +
          encodeURI(file.name)
      )
        .then(res => {
          const data = res.data;
          const fd = new FormData();
          fd.append("key", data.key);
          fd.append("acl", "private");
          fd.append("Content-Type", file.type);
          fd.append("AWSAccessKeyId", data.access_key);
          fd.append("policy", data.encoded_policy);
          fd.append("signature", data.signature);
          fd.append("file", file, file.name);
          Axios.post(data.upload_url, fd, {
            processData: false,
            contentType: false,
            xhr: this.progress,
            beforeSend: function(req) {
              req.setRequestHeader("Authorization", "");
            }
          })
            .then(res => {
              console.log("Successfully Uploaded the video", res);
              this.setState({ uploading: false });
            })
            .catch(err => console.error(err));
        })
        .then(res => {
          this.setState({
            newUpload: {}
          });
          this.getVideos();
        })
        .catch(err => console.error(err));
    }
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({
      newUpload: event.target.files
    });
  }

  componentDidMount() {
    this.getVideos();
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    const { isAuthenticated, login } = this.props.auth;
    return (
      <div className="container">
        {isAuthenticated() && (
          <div>
            <h4>You are logged in!</h4>
            <h3>About Your Access Token</h3>
            <p>
              Your <code>access_token</code> has an expiry date of:{" "}
              {this.getExpiryDate()}
            </p>
            <p>
              The token has been scheduled for renewal, but you can also renew
              it manually from the navbar if you don't want to wait.
            </p>
            <div className="container">
              <div className="box">
                <form onSubmit={this.handleSubmit}>
                  <input type="file" onChange={this.handleChange} />
                  <Button disabled={this.state.uploading} type="submit">
                    {this.state.uploading ? "Uploading..." : "Upload"}
                  </Button>
                </form>
                <hr />
              </div>
              <br />
              <div className="columns">
                {this.state.videos.map((filename, i) => {
                  return (
                    <div className="column" key={i}>
                      <video controls style={{ width: "50%" }}>
                        <source
                          src={`https://s3-eu-west-1.amazonaws.com/serverless-video-transcoded-ua/${
                            filename.filename
                          }`}
                          type="video/mp4"
                        />
                      </video>
                      <br />
                      <br />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!isAuthenticated() && (
          <div>
            <h4>
              You are not logged in! Please{" "}
              <a style={{ cursor: "pointer" }} onClick={login.bind(this)}>
                Log In
              </a>{" "}
              to continue.
            </h4>
          </div>
        )}
      </div>
    );
  }
}

export default Home;
