/* eslint-disable  @typescript-eslint/no-unused-vars */
import "./App.css";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useRef } from "react";
import MapGrid from "./MapGrid";
import { isEntityName } from "typescript";
import { useState } from "react";



function App() {

  type Entity = {
    id :number
    type: string
    row : number
    col : number
    movement: number
    props:any
  }
  const playerName: string = "a";
  const editorRef:any = useRef(null);
  const playConsole:any = useRef(null);
  const mapData = require("./maps/test.json");
  const Memory: any[] = [];

  const [reload, setReload] = useState(false);
  const [playing, setPlaying] = useState(false);



  const setupLogger = () => {
    console.log(playConsole)
    var old = console.log;
    console.log = function (message) {
      if(playConsole){
        if (typeof message == 'object') {
          (playConsole.current as HTMLParagraphElement).innerHTML+= (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
      } else {
        (playConsole.current as HTMLParagraphElement).innerHTML += message + '<br />';
      }
      }else{
        old(message);
      }

    }
  };


  const reloadGrid = () => {
    setReload(reload ? false : true); // get me out
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.editor.defineTheme("myTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [{ background: "FFFFFF" }],
      colors: {
        "editor.foreground": "#FFFFFF",
        "editor.background": "#000000",
        "editorCursor.foreground": "#FFFFFF",
        "editor.lineHighlightBackground": "#000000",
        "editorLineNumber.foreground": "#FFFFFF",
        "editor.selectionBackground": "#FFFFFF",
        "editor.inactiveSelectionBackground": "#000000",
      },
    });
    monaco.editor.setTheme("myTheme");
    editorRef.current = editor;
    setupLogger();
  };

  const showValue = () => {
    alert(editorRef?.current);
  };

  const getEntities = (type: string): any[] => {
    var entities: any[] = [];
    for (const [rowKey, rowValue] of Object.entries(mapData.tiles.rows)) {
      for (const [cellKey, cellValue] of Object.entries(
        mapData.tiles.rows[rowKey]
      )) {
        const value = cellValue as any;
        if(cellValue && (cellValue as any).type === type){
          var entity: Entity = {
            id: value.id,
            col : +cellKey,
            row : +rowKey,
            type: value.type,
            movement: value.movement ? value.movement : 0,
            props : cellValue
          }
          entities.push(entity)
        }
      }
    }
    return entities;
  };

  const findEntityById = (id:number) : any => {
    for (const [rowKey, rowValue] of Object.entries(mapData.tiles.rows)) {
      for (const [cellKey, cellValue] of Object.entries(
        mapData.tiles.rows[rowKey]
      )) {
        const value = cellValue as any;
        if(cellValue && value.id === id){
          var entity: Entity = {
            id: value.id,
            col : +cellKey,
            row : +rowKey,
            type: value.type,
            movement: value.movement ? value.movement : 0,
            props : cellValue
          }
          return entity;
        }
      }
    }
  }


  const getMonsters = ()  : Entity[] => {
    return getEntities('monster');
  }

  const getRocks = () : Entity[]=> {
    return getEntities('rock')
  }

  const findQueen = () : Entity => {
    return getEntities('queen')[0]
  }

  const getHero = ()  : Entity => {
    return getEntities('hero')[0]
  }

  const isInbounds = (x: number, y:number) : boolean => {
    return (mapData.defaults.xsize > x && x >= 0) && (mapData.defaults.ysize > y && y >= 0)
  }


  //TODO(mike): FIX!!!!
  const isBlocked = (x: number, y:number) : boolean => {
    if(["queen","gem"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) >= 0){
      console.log("You have won! THANKS FOR SAVING COOERULE. YOURE GREAT")
      setPlaying(false);
    }

    return ["monster","rock","water"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) > 0
  } 

  const clearTile = (x: number, y:number) => {
    mapData.tiles.rows[y+""][""+x] = null;
  }

  const setTile = (entity : Entity) =>{
    mapData.tiles.rows[entity.row+""][""+entity.col] = entity.props;
  }

  const updateTile = (entity: Entity, oldX: number, oldY : number) => {
    clearTile(oldX, oldY)
    setTile(entity)
  }

  const moveUp = (entity: Entity) => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.row= entity.row - entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go up");
      return;
    }
    updateTile(entity, oldX,oldY);
  }

  const moveDown = (entity: Entity) => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.row=  oldY + 1;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go down");
      return;
    }
    updateTile(entity, oldX,oldY);
  }

  const moveLeft = (entity:Entity) => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.col = oldX - entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go left");
      return;
    }
    updateTile(entity, oldX,oldY);
  }

  const moveRight = (entity: Entity) => {
    var oldX = entity.col;
    var oldY = entity.row;
    console.log(entity);
    entity.col = oldX + entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go right");
      return;
    }
    updateTile(entity, oldX,oldY);
  }


  const play = () => {
    if(playing){
      return;
    }
    console.log("Play is starting...");
    setPlaying(true);
    turn();
  }

  const turn = () => {
    //TODO: Calculate Movement Speed for order of execution
    heroTurn();
    reloadGrid(); //TODO: fix with states  naaaaaaaaah or maybe not
  }

  const heroTurn = () => {
    console.log("It's the heroes turn!")
    var heroCode = editorRef!.current!.getValue();
    var re = /mapData/gi;
    eval(heroCode.replace(re, 'no cheeto my mateo'));

  }


  return (
    <div className="Container">
      <div className="title">
        <h1>Legend of the Coder</h1>
        <h5 className="subtitle">A Serious Game Project</h5>
      </div>
      <div className="App">
        <div className="Play-grid"> 
          {reload &&
          <MapGrid mapData={mapData}></MapGrid>
          } 
          {!reload &&
          <MapGrid mapData={mapData}></MapGrid>
          }

          <p className="console" ref={playConsole}></p>
        </div>
        <div className="Dev-area">
          <Editor
            className="mainEditor"
            height="80vh"
            theme="vs-dark"
            defaultLanguage="typescript"
            defaultValue="/* some comment
        test */"
            onMount={handleEditorDidMount}
          />
          <div className="buttonBar" onClick={play}>
            <p unselectable="on" className={'playText ' + (playing ? 'running' : '')}>PLAY</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
