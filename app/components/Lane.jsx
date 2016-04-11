import AltContainer from 'alt-container';
import React from 'react';

import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import LaneActions from '../actions/LaneActions';
import Editable from './Editable.jsx';

import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const laneSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

const laneTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;
    const itemType = monitor.getItemType();

    if((itemType === ItemTypes.NOTE) && !targetProps.lane.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.lane.id,
        noteId: sourceId
      });
    } else if((itemType === ItemTypes.LANE) && sourceId !== targetId){
      targetProps.onMove({sourceId, targetId});
    }
  }
};

@DragSource(ItemTypes.LANE, laneSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget([ItemTypes.NOTE, ItemTypes.LANE], laneTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Lane extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget, isDragging, lane, ...props} = this.props;

    const dragSource = lane.editing ? a => a : connectDragSource;

    return dragSource(connectDropTarget(
      <div {...props} opacity = {isDragging ? 0 : 1}>
        <div className="lane-header" onClick={this.activateLaneEdit}>
          <div className="lane-add-note">
            <button onClick={this.addNote}>+</button>
          </div>
          <Editable className="lane-name" editing={lane.editing}
            value={lane.name} onEdit={this.editName} />
          <div className="lane-delete">
            <button onClick={this.deleteLane}>x</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getNotesByIds(lane.notes)
          }}
        >
          <Notes
            onValueClick={this.activateNoteEdit}
            onEdit={this.editNote}
            onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    ));
  }

  editNote = (id, task) => {
    const laneId = this.props.lane.id;
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      NoteActions.update({id, editing: false});

      return;
    }
    LaneActions.update({id: laneId, editing: false});
    NoteActions.update({id, task, editing: false});
  }
  addNote = (e) => {
    e.stopPropagation();
    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New task'});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };

  deleteNote = (noteId, e) => {
    e.stopPropagation();

    const laneId = this.props.lane.id;

    LaneActions.detachFromLane({laneId, noteId});
    NoteActions.delete(noteId);
  };


  editName = (name) => {
    const laneId = this.props.lane.id;

    // Don't modify if trying to set an empty value
    if(!name.trim()) {
      LaneActions.update({id: laneId, editing: false});

      return;
    }

    LaneActions.update({id: laneId, name, editing: false});
  };
  deleteLane = () => {
    const laneId = this.props.lane.id;

    LaneActions.delete(laneId);
  };
  activateLaneEdit = () => {
    const laneId = this.props.lane.id;

    LaneActions.update({id: laneId, editing: true});
  };
  activateNoteEdit = (id) => {
    const laneId = this.props.lane.id;

    NoteActions.update({id, editing: true});
    LaneActions.update({id: laneId, editing: true});
  }
}
