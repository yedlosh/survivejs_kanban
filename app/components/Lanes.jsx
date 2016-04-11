import React from 'react';
import Lane from './Lane.jsx';

const Lanes = ({lanes}) => (
  <div className="lanes">{lanes.map(lane =>
      <Lane className="lane" key={lane.id} lane={lane} />
    )}</div>
);

export default Lanes;
