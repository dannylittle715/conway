import React, { useState, useCallback, useRef, useEffect } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

export const Conway = () => {
  const numRows = Math.floor(window.innerHeight / 33);
  const numCols = Math.floor(window.innerWidth / 32);

  const generateGrid = empty => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(
        empty
          ? Array.from(Array(numCols), () => 0)
          : Array.from(Array(numCols), () => (Math.random() > 0.65 ? 1 : 0))
      );
    }

    return rows;
  };

  const [grid, setGrid] = useState(() => generateGrid(false));
  const [drawing, setDrawing] = useState(false);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(running);
  runningRef.current = running;

  const simulate = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

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
      const gridCopy = _.cloneDeep(g);
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          let neighbors = 0;
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

    setTimeout(simulate, 500);
  }, [numRows, numCols]);

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

  return (
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            simulate();
          }
        }}
      >
        {running ? 'stop' : 'start'}
      </button>
      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(
              Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
          }
          setGrid(rows);
        }}
      >
        random
      </button>
      <button
        onClick={() => {
          setRunning(false);
          setGrid(generateGrid(true));
        }}
      >
        clear
      </button>
      <CellGrid numCols={numCols} numRows={numRows}>
        {grid.map((rows, r) =>
          rows.map((col, c) => (
            <div
              key={`${r}x${c}`}
              onClick={() => {
                const gridCopy = _.cloneDeep(grid);
                gridCopy[r][c] = 1;
                setGrid(gridCopy);
              }}
              onMouseMove={e => {
                if (!drawing) return;
                const gridCopy = _.cloneDeep(grid);
                gridCopy[r][c] = 1;
                setGrid(gridCopy);
              }}
              style={{
                backgroundColor: grid[r][c] ? 'pink' : 'black',
              }}
            />
          ))
        )}
      </CellGrid>
    </>
  );
};

export default Conway;

const CellGrid = styled.div`
  display: grid;
  gap: 1px;
  grid-template-columns: ${({ numCols }) => 'repeat(' + numCols + ', 30px)'};
  grid-template-rows: ${({ numRows }) => 'repeat(' + numRows + ', 30px)'};
`;
