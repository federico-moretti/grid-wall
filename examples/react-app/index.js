import React from 'react';
import ReactDOM from 'react-dom';

import ReflowGrid from '../../dist/index';

function getRandomItem(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStyle() {
  const colors = ['red', 'orange', 'purple', 'green', 'blue'];
  return {
    backgroundColor: getRandomItem(colors),
    height: getRandomInteger(150, 300) + 'px',
    margin: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  };
}

function App() {
  const containerRef = React.useRef();
  const [posts, setPosts] = React.useState([
    { id: 1, style: randomStyle() },
    { id: 2, style: randomStyle() },
    { id: 3, style: randomStyle() },
  ]);

  function addPost() {
    let id = 1;
    if (posts.length > 0) {
      id = posts[posts.length - 1].id + 1;
    }
    const post = {
      id,
      style: randomStyle(),
    };
    const newPosts = [...posts, post];
    setPosts(newPosts);
  }

  function removePost(id) {
    const indexPostToRemove = posts.findIndex(post => post.id === id);
    const newPosts = [...posts];
    newPosts.splice(indexPostToRemove, 1);
    setPosts(newPosts);
  }

  React.useEffect(() => {
    new ReflowGrid({
      container: containerRef.current,
      childrenWidthInPx: 200,
      enableResize: true,
      insertStyle: {
        opacity: '0',
        transition: 'opacity 0.2s ease-in, transform 0s ease-in',
      },
      beforeStyle: {
        opacity: '1',
      },
      afterStyle: {
        transition: 'opacity 0.2s ease-in, transform 0.2s ease-in',
      },
    });
  }, []);

  return (
    <React.Fragment>
      <button onClick={addPost}>Add post</button>
      <div ref={containerRef}>
        {posts.map(post => (
          <Post key={post.id} {...post} remove={() => removePost(post.id)} />
        ))}
      </div>
    </React.Fragment>
  );
}

function Post(props) {
  return (
    <div>
      <div style={props.style}>
        <span style={{ fontSize: '24px', color: 'white' }}>Post #{props.id}</span>
        <button onClick={props.remove}>remove</button>
      </div>
    </div>
  );
}

var mountNode = document.getElementById('root');
ReactDOM.render(<App />, mountNode);
