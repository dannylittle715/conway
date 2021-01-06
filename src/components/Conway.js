import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

export const Conway = ({ width, height }) => {
  const [randomizer, setRandomizer] = useState(0.4);
  const [tick, setTick] = useState(600);

  //grid logic
  const numRows =
    height === undefined
      ? Math.floor(window.innerHeight / 40)
      : Math.floor(height / 40);

  const numCols =
    width === undefined
      ? Math.floor(window.innerWidth / 30)
      : Math.floor(width / 30);

  const generateGrid = empty => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(
        empty
          ? Array.from(Array(numCols), () => 0)
          : Array.from(Array(numCols), () =>
              Math.random() < randomizer ? 1 : 0
            )
      );
    }
    return rows;
  };

  const [grid, setGrid] = useState(() => generateGrid(false));
  const [drawing, setDrawing] = useState(false);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(running);
  runningRef.current = running;

  const simulate = useCallback(async () => {
    if (!runningRef.current) return;

    const operations = [
      [0, 1],
      [0, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, 0],
      [-1, 0],
    ];

    setGrid(g => {
      const { gridCopy } = JSON.parse(JSON.stringify({ gridCopy: g }));
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          let neighbors = 0;
          if (g[r + 1] === undefined) return gridCopy;
          operations.forEach(([dr, dc]) => {
            const _r = r + dr;
            const _c = c + dc;
            if (_r >= 0 && _r < numRows && _c >= 0 && _c < numCols) {
              neighbors += g[_r][_c];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            gridCopy[r][c] = 0;
          } else if (g[r][c] === 0 && neighbors === 3) {
            gridCopy[r][c] = 1;
          }
        }
      }
      return gridCopy;
    });

    setTimeout(() => requestAnimationFrame(simulate), tick);
  }, [numRows, numCols, tick]);

  useEffect(() => {
    simulate();
    const handleMouseUp = () => setDrawing(false);
    const handleMouseDown = () => setDrawing(true);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [simulate]);

  //click handlers
  const handleStartStopClick = () => {
    console.log(!running ? 'starting sim' : 'stopping sim');
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      simulate();
    }
  };

  const startSimulation = () => {
    if (!running) {
      console.log('starting simulation');
      setRunning(true);
      runningRef.current = true;
      simulate();
    }
  };

  const handleClearClick = () => {
    setRunning(false);
    setGrid(generateGrid(true));
  };

  const handleCellClick = (r, c) => {
    const { gridCopy } = JSON.parse(JSON.stringify({ gridCopy: grid }));
    gridCopy[r][c] = 1;
    setGrid(gridCopy);
  };

  const handleCellMove = (r, c) => {
    if (!drawing) return;
    const { gridCopy } = JSON.parse(JSON.stringify({ gridCopy: grid }));
    gridCopy[r][c] = 1;
    setGrid(gridCopy);
  };

  return (
    <div className='conway'>
      <div>
        <div style={{ textAlign: 'center' }}>
          <a
            href='https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'
            target='blank'
          >
            <h1>Conway's Game of Life</h1>
          </a>
          <small>
            Made by{' '}
            <a href='https://dannylittle.vercel.app' target='blank'>
              Danny little
            </a>
          </small>
        </div>
        <div
          style={{
            maxWidth: 'min(600px, 90%)',
            margin: '0 auto',
            marginTop: '10px',
          }}
        >
          Tips:
          <ul>
            <li>Try clicking and dragging on the board.</li>
            <li>
              Try to find the position on the "Percent Alive" slider that
              results in a stable game.
            </li>
            <li>
              Click and drag on the sliders for best results! Clicking alone
              results in some buginess.
            </li>
          </ul>
        </div>
      </div>
      <Options>
        <Buttons>
          <button onClick={handleStartStopClick}>
            {running ? 'Stop' : 'Start'}
          </button>
          <button onClick={handleClearClick}>Clear</button>
          <button
            onClick={() => {
              setGrid(generateGrid(false));
              if (!running) {
                setTimeout(handleStartStopClick, tick);
              }
            }}
          >
            Random
          </button>
        </Buttons>
        <LabeledSlider>
          <label htmlFor='randomizer'>Percent living</label>
          <input
            type='range'
            min='0'
            max='100'
            value={randomizer * 100}
            onChange={e => setRandomizer(e.target.value / 100)}
            onMouseDown={() => setRunning(false)}
            onMouseUp={() => {
              setGrid(generateGrid());
              setTimeout(startSimulation, tick);
            }}
            id='randomizer'
          />
        </LabeledSlider>
        <LabeledSlider>
          <label htmlFor='tick'>Speed</label>
          <input
            type='range'
            min='0'
            max='800'
            value={1000 - tick}
            onChange={e => {
              setTick(1000 - e.target.value);
            }}
            onMouseDown={() => setRunning(false)}
            onMouseUp={startSimulation}
            id='tick'
          />
        </LabeledSlider>
      </Options>
      <CellGrid numCols={numCols} numRows={numRows}>
        {grid.map((rows, r) =>
          rows.map((col, c) => (
            <div
              key={`${r}x${c}`}
              onClick={e => handleCellClick(r, c)}
              onMouseMove={e => handleCellMove(r, c)}
              style={{
                backgroundColor: grid[r][c] ? '#4287f5' : '#111',
                transition: 'background-color 200ms linear',
              }}
            />
          ))
        )}
      </CellGrid>
    </div>
  );
};

export default Conway;

const LabeledSlider = styled.div`
  display: flex;
  flex-direction: column;
`;

const CellGrid = styled.div`
  overflow-x: hidden;
  justify-content: center;
  display: grid;
  grid-template-columns: ${({ numCols }) => 'repeat(' + numCols + ', 30px)'};
  grid-template-rows: ${({ numRows }) => 'repeat(' + numRows + ', 30px)'};
`;

const Options = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  @media only screen and (max-width: 600px) {
    flex-direction: column;
  }
`;

const Buttons = styled.div`
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  button {
    transition: background 100ms;
    border: none;
    border-radius: 5px;
    padding: 10px;
    margin: 0 10px;
    background: #f0f0f0;
    font-size: 15px;
    cursor: pointer;
    :hover {
      background: #4287f5;
      color: #f0f0f0;
    }
  }
`;
