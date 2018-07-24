import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';


const ID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};
 
const getItems = (lists) =>
  Array.from({ length: lists }, (v, k) => k).map(k => ({
    id: `list-${k}`,
    name: `list ${k}`,
    cards: Array.from({ length: Math.floor(Math.random() * 10) }, (v, k) => k).map(k => ({
      id: `card${ID()}`,
      name: `card ${k}`
    }))
  }))

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    background: isDragging ? 'lightgreen' : 'grey',
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250
});

class App extends Component {
    state = {
        lists: getItems(5)
    };
    
    findListById = id => this.state.lists.find(item => item.id === id)

    updateList = (list, updated) => {
      const updatedItem = list.findIndex(item => item.id === updated.id)
      return [
        ...list.slice(0, updatedItem),
        updated,
        ...list.slice(updatedItem+1)
      ]
    }

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const list = this.findListById(source.droppableId)
            const items = reorder(
                this.findListById(source.droppableId).cards,
                source.index,
                destination.index
            );
            const newList = {
              ...list,
              cards: items
            }
            const newLists = this.updateList(this.state.lists, newList)

            this.setState({
              lists: newLists
            });

        } else {
            const sourceList = this.findListById(source.droppableId)
            const destList = this.findListById(destination.droppableId)
            const result = move(
                this.findListById(source.droppableId).cards,
                this.findListById(destination.droppableId).cards,
                source,
                destination
            );
            const newSourceList = {
              ...sourceList,
              cards: result[source.droppableId]
            }
            const newDestList = {
              ...destList,
              cards: result[destination.droppableId]
            }

            const halfLists = this.updateList(this.state.lists, newSourceList)
            const newLists = this.updateList(halfLists, newDestList)

            this.setState({
              lists: newLists
            });
        }
    };
    render() {
        return (
          <div className="wrapper">
            <DragDropContext onDragEnd={this.onDragEnd}>
              {this.state.lists.map(list => (
                <div key={list.id}>
                  <Droppable droppableId={list.id}>
                      {(provided, snapshot) => (
                          <div
                              ref={provided.innerRef}
                              style={getListStyle(snapshot.isDraggingOver)}>
                              {list.cards.map((card, index) => (
                                  <Draggable
                                      key={card.id}
                                      draggableId={card.id}
                                      index={index}>
                                      {(provided, snapshot) => (
                                          <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              style={getItemStyle(
                                                  snapshot.isDragging,
                                                  provided.draggableProps.style
                                              )}>
                                              {console.log(provided)}
                                              {card.name}
                                          </div>
                                      )}
                                  </Draggable>
                              ))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </div>
        );
    }
}

export default App;
