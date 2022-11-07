import React, { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Dropdown } from "react-bootstrap";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { MdModeEdit, MdDelete, MdShare } from "react-icons/md";
import Card from "react-bootstrap/Card";
import AuthContext from "../../context/AuthContext";
import "./ExplorePostCard.css";
import useAxios from "../../utils/useAxios";
import { useEffect } from "react";
import EditPost from "./EditPost";
import { BsFillHeartFill, BsCursorFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
export default function PostCard(props) {
  const user_id = localStorage.getItem("user_id");
  const post_user_id = props.post.author.uuid;
  const { baseURL } = useContext(AuthContext); // our api url http://127.0.0.1/service
  const [comments, setComments] = useState([]);
  const [showEditPost, setShowEditPost] = useState(false);
  const api = useAxios();
  const [likeCount, setLikeCount] = useState(0);
  const [CommentCount, setCommentCount] = useState(0);
  const [color, setColor] = useState("white");
  const [author, setAuthor] = useState("");
  const [followers, setFollowers] = useState([]);

  const navigate = useNavigate();
  const routeChange = () => {
    navigate(`/authors/${post_user_id}/`, { state: { refresh: true } });
  };

  const [showContent, setShowContent] = useState(() => {
    if (props.post.contentType.startsWith("image")) {
      return false;
    } else {
      return true;
    }
  });
  const postRouteChange = () => {
    var rout = props.post.id.split("authors/")[1];
    navigate(`/authors/${rout}`);
  };

  const sendPostLike = (uuid) => {
    const postLike = {
      type: "like",
      summary: `${author.displayName} Likes your post.`,
      author: author,
      object: props.post.id,
    };
    api
      .post(`${baseURL}/authors/${post_user_id}/inbox/`, postLike)
      .then((response) => {
        setColor("var(--orange)");
        setLikeCount((likeCount) => likeCount + 1);
      })
      .catch((error) => {
        console.log("Failed to get posts of author. " + error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      await api
        .get(`${baseURL}/authors/${user_id}/`)
        .then((response) => {
          setAuthor(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
      await api
        .get(
          `${baseURL}/authors/${post_user_id}/posts/${props.post.uuid}/likes`
        )
        .then((response) => {
          setLikeCount((likeCount) => response.data.items.length);
        })
        .catch((error) => {
          console.log(error);
        });
      await api
        .get(
          `${baseURL}/authors/${post_user_id}/posts/${props.post.uuid}/comments/`
        )
        .then((response) => {
          const commentArray = response.data.comments;
          setCommentCount(commentArray.length);
          if (commentArray.length !== 0) {
            for (let i = 0; i < commentArray.length; i++) {
              const comment = commentArray[i];
              setComments((comments) => [...comments, comment]);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
      await api
        .get(
          `${baseURL}/authors/${user_id}/followers`
        )
        .then((response) => {
          setFollowers(response.data.items)})
        .catch((error) => {
          console.log(error);
        });
    };
    fetchData();
  }, []);

  const deletePost = (uuid) => {
    api
      .delete(`${baseURL}/authors/${user_id}/posts/${uuid}`)
      .then((response) => {
        window.location.reload(true);
      })
      .catch((error) => {
        alert(`Something went wrong posting! \n Error: ${error}`);
        console.log(error);
      });
  };

  const sharePost = (post) => {
    console.log(post.id)
    for(let index = 0; index < followers.length; index++) {
      const sharedPost = {
        type: "post",
        summary: `${author.displayName} shared a post.`,
        author: author,
        object: post.id,
      };
      api
        .post(`${baseURL}/authors/${followers[index].uuid}/inbox/`, post)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log("Failed to get posts of author. " + error);
        });
    }
  };

  // only render options if the user viewing it is the author of it
  function PostOptions() {
      return (
        <div className="options">
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic">
              <BiDotsVerticalRounded />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => sharePost(props.post)}>
                <MdShare /> Share Post
              </Dropdown.Item>

              {(() => {
                if (user_id === props.post.author.uuid) {
                    return (
                      <div>
                      <Dropdown.Item onClick={() => setShowEditPost(true)}>
                        <MdModeEdit /> Edit Post
                      </Dropdown.Item>

                      <Dropdown.Item
                        className="delete-post"
                        onClick={() => deletePost(props.post.uuid)}
                      >
                        <MdDelete /> Delete Post
                      </Dropdown.Item>
                      </div>
                    )
              }
              })()}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
  }

  return (
    <Card className="post-card-explore">
      <Card.Header>
        <div className="post-author" onClick={routeChange}>
          <div className="profile-pic-post">
            <img src={props.post.author.profileImage} alt="profilePic" />
          </div>
          <div className="post-author-name">
            {props.post.author.displayName}
          </div>
        </div>
        <PostOptions />
        {showEditPost && (
          <EditPost
            show={showEditPost}
            onHide={() => setShowEditPost(false)}
            post={props.post}
          />
        )}
      </Card.Header>
      <Card.Img variant="top" src="" />
      <Card.Body>
        <Card.Title>
          <ReactMarkdown>{props.post.title}</ReactMarkdown>
        </Card.Title>
        <Card.Text>
          {props.post.image ? (
            <img
              className="post-image"
              src={props.post.image}
              alt="postImage"
              style={{ height: "100%", width: "100%", objectfit: "contain" }}
            />
          ) : showContent ? (
            <ReactMarkdown>{props.post.content}</ReactMarkdown>
          ) : null}
        </Card.Text>

        <hr />
        <Row>
          <Col>
            <div>
              <BsFillHeartFill
                style={{ color: likeCount != 0 ? "var(--orange)" : "white" }}
                onClick={() => sendPostLike(props.post.uuid)}
              />
            </div>
          </Col>
          <Col>
            <Popup
              trigger={
                <button
                  style={{
                    background: "none",
                    border: "none",
                    right: "10px",
                    position: "absolute",
                  }}
                >
                  <BsCursorFill
                    style={{ color: "white" }}
                    onClick={postRouteChange}
                  />
                </button>
              }
              position="bottom center"
              on="hover"
              closeOnDocumentClick
              mouseLeaveDelay={300}
              mouseEnterDelay={0}
              arrow={true}
            >
              <span> Click for details! </span>
            </Popup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
