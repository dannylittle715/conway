import styled from 'styled-components';

export const Cell = styled.div`
  background: ${({ val }) => (val === 1 ? 'blue' : 'black')};
  border: solid 1px white;
`;

export const CellGrid = styled.div`
  overflow-x: hidden;
  display: grid;
  grid-template-columns: ${({ numCols }) => 'repeat(' + numCols + ', 20px)'};
  grid-template-rows: ${({ numRows }) => 'repeat(' + numRows + ', 20px)'};
`;
