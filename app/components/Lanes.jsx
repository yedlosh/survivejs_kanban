import React from 'react';
import Lane from './Lane.jsx';

import LaneActions from '../actions/LaneActions';

const Lanes = ({lanes}) => (
  <div className="lanes">{lanes.map(lane =>
      <Lane
        className="lane"
        key={lane.id}
        id={lane.id}
        lane={lane}
        onMove={LaneActions.moveLane} />
    )}</div>
);

export default Lanes;
