import React from 'react';
import ReactDOM from 'react-dom';

import ReflowGrid from '../../dist/index';

const addButtonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  margin: '20px',
};

const addButtonStyle = {
  border: 'none',
  color: 'white',
  fontSize: '20px',
  outline: 'none',
  padding: '10px 15px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

function getRandomItem(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStyle() {
  const colors = ['red', 'orange', 'purple', 'green', 'blue'];
  const selectedColor = getRandomItem(colors);
  return {
    backgroundColor: selectedColor,
    height: getRandomInteger(150, 300) + 'px',
    margin: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: `4px solid ${selectedColor}`,
  };
}

function App() {
  const containerRef = React.useRef();
  const [tiles, setTiles] = React.useState([
    { id: 1, style: randomStyle() },
    { id: 2, style: randomStyle() },
    { id: 3, style: randomStyle() },
  ]);

  function addPost() {
    let id = 1;
    if (tiles.length > 0) {
      id = tiles[tiles.length - 1].id + 1;
    }
    const post = {
      id,
      style: randomStyle(),
    };
    const newTiles = [...tiles, post];
    setTiles(newTiles);
  }

  function removePost(id) {
    const indexPostToRemove = tiles.findIndex(post => post.id === id);
    const newTiles = [...tiles];
    newTiles.splice(indexPostToRemove, 1);
    setTiles(newTiles);
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
    <div style={{ width: '60%', margin: 'auto' }}>
      <div style={addButtonContainerStyle}>
        <button style={addButtonStyle} onClick={addPost}>
          add tile
        </button>
      </div>
      <div ref={containerRef}>
        {tiles.map(tile => (
          <Tile key={tile.id} {...tile} remove={() => removePost(tile.id)} />
        ))}
      </div>
    </div>
  );
}

function Tile(props) {
  const style = {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    outline: 'none',
  };

  return (
    <div>
      <div style={props.style}>
        <button style={style} onClick={props.remove}>
          remove
        </button>
      </div>
    </div>
  );
}

var mountNode = document.getElementById('root');
ReactDOM.render(<App />, mountNode);
