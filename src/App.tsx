/* eslint-disable  @typescript-eslint/no-unused-vars */
import "./App.css";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useRef } from "react";
import MapGrid from "./MapGrid";
import { isEntityName } from "typescript";
import { useState } from "react";
import { useEffect } from "react";



function App() {

  type Entity = {
    id :number
    type: string
    row : number
    col : number
    movement: number,
    initiative: number,
    props:any
  }
  const playerName: string = "a";
  const editorRef:any = useRef(null);
  const playConsole:any = useRef(null);
  const [mapData,setMapData] = useState(require("./maps/test.json"));
  const Memory: any[] = [];

  const [reload, setReload] = useState(false);
  const [playing, setPlaying] = useState('false');
  const [intro, setIntro] = useState(true);


  const baseDelay = 400; //1500 too slow

  useEffect(() => {
    if(editorRef){
      editorRef?.current?.updateOptions({
        readOnly: playing === 'true'
      })
      console.log("***CODING EDITING HAS BEEN LOCKED*****")
      turn();
    }

  }, [playing])

  useEffect(() => {

  }, [mapData])
  


  useEffect(() => {
    if(reload){
      //delay(700);
      setReload( r => !r);
    }
  }, [reload])

  /*SOUNDS 
  var ost = new Audio('./sounds/theme.mp3');
  var mvmt = new Audio('http://noproblo.dayjo.org/ZeldaSounds/LOZ/LOZ_Stairs.wav');*/

  useEffect(() => {
   /* if(!intro){
      //var audio = new Audio('https://dl68.youtubetomp3music.com/file/youtubeIOhE-nkJxwM128.mp3?fn=Switched%20On%20-%20Zelda%20-%20%20A%20Link%20To%20The%20Past.mp3');
      ost.volume = 0.2;
      ost.play();
    }*/
  }, [intro])


const playMovementSound = () =>{/*
  //http://noproblo.dayjo.org/ZeldaSounds/LOZ/LOZ_Stairs.wav
  mvmt.volume = 0.5;
  mvmt.play();*/
}

  const setupLogger = () => {
    console.log(playConsole)
    var old = console.log;
    console.log = function (message) {
      if(playConsole){
        (playConsole.current as HTMLParagraphElement).scrollTop = (playConsole.current as HTMLParagraphElement).scrollHeight;
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


  /*
  const reloadGrid = () => {
    console.log("reloadingGrid "+ reload)
    setReload(true); // get me out
    console.log("reloadingGrid "+ reload)
  }
  */

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
            initiative: value.initiative ? value.initiative : 1,
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
            initiative: value.initiative ? value.initiative : 1,
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


  const isBlocked = (x: number, y:number) : boolean => {
    if(["queen","gem"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) >= 0){
      console.log("You have won! THANKS FOR SAVING COOERULE. YOURE GREAT")
      setPlaying('false');
    }

    return ["monster","rock","water","hero"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) > 0
  } 

  const clearTile = (x: number, y:number) => {
    if(mapData.tiles.rows[y+""] &&  mapData.tiles.rows[y+""][""+x]){
      mapData.tiles.rows[y+""][""+x] = null;
      setMapData(mapData);
    }

  }

  const setTile = (entity : Entity) =>{
    mapData.tiles.rows[entity.row+""][""+entity.col] = entity.props
    setMapData(mapData);
  }

  const updateTile = (entity: Entity, oldX: number, oldY : number) => {
    clearTile(oldX, oldY)
    playMovementSound();
    setTile(entity)
  }

  const moveUp = (entity: Entity):boolean => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.row= entity.row - entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go up");
      entity.col = oldX;
      entity.row = oldY;
      return false;
    }
    updateTile(entity, oldX,oldY);
    return true;
  }

  const moveDown = (entity: Entity) : boolean => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.row=  oldY + 1;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go down");
      entity.col = oldX;
      entity.row = oldY;
      return false;
    }
    updateTile(entity, oldX,oldY);
    return true;
  }

  const moveLeft = (entity:Entity) : boolean => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.col = oldX - entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go left");
      entity.col = oldX;
      entity.row = oldY;
      return false;
    }
    updateTile(entity, oldX,oldY);
    return true;
  }

  const moveRight = (entity: Entity) :boolean => {
    var oldX = entity.col;
    var oldY = entity.row;
    entity.col = oldX + entity.movement;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go right");
      entity.col = oldX;
      entity.row = oldY;
      return false;
    }
    updateTile(entity, oldX,oldY);
    return true;
  }

/*****HELPER METHODS*********/

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

function getRandomArbitrary(min:number, max:number) {
  return Math.random() * (max - min) + min;
}

/********************* */


  const play = () => {
    if(playing === 'true'){
      return;
    }
    console.log("Play is starting...");
    setPlaying('true');
  }

  const allTurns = async (entities: Entity[]) => {
    var index = 0;

    const entityTurn = async (entity:Entity) => {
        if(entity.type === 'hero'){
          heroTurn();
        }else{
          monsterTurn(entity);
        }
        setReload(true)
        await delay(baseDelay);
        index++;
        if(index < entities.length){
          entityTurn(entities[index])
        }
      }
    await entityTurn(entities[index])

  }

  const  turn = async () => {
    console.log("turn");
    while (playing==='true' && findQueen()) {
      var entities = getMonsters();
      entities.push(getHero());
      entities = entities.sort((x,y) => x.initiative - y.initiative);
      await allTurns(entities);
      await delay(entities.length * (baseDelay+ (baseDelay/100)));
      //await reloadGrid();
      //TODO: fix with states  naaaaaaaaah or maybe not

    }

  }

  const heroTurn = () => {
    console.log("****It's the hero's turn!******")
    var heroCode = editorRef!.current!.getValue();
    var re = /mapData/gi;
    eval(heroCode.replace(re, 'no cheeto my mateo'));

  }

  const monsterTurn = (monster:Entity) => {
    console.log("---Monster "+monster.id+" turn---")
    //SAMPLE CODE / in further version logic should be interchangeable
    var hero = getHero();
    var colDiff = hero.col - monster.col;
    var rowDiff = hero.row - monster.row;
    var notBlocked = true;
    if(Math.abs(rowDiff) > Math.abs(colDiff) ){ // check which axis is further away, then reduce the one closer
        //reduce row axis
        if(rowDiff<0){
         notBlocked= moveUp(monster);
        }else if(rowDiff >= 1){
         notBlocked= moveDown(monster);
        }
    }else{
      //recude col axis
      if(colDiff<0){
        notBlocked= moveLeft(monster);
      }else if(colDiff >= 1){
       notBlocked = moveRight(monster);
      }
    }
    while(!notBlocked){
        {
          var movementOptions = [():boolean => {return moveDown(monster)}, ():boolean => {return moveUp(monster)}, ():boolean => {return moveLeft(monster)}, ():boolean => {return moveRight(monster)}];
          var pick = getRandomArbitrary(0,movementOptions.length-1);
          notBlocked = movementOptions[Math.trunc(pick)]();
          console.log("Monster is confused, looking for alternative path")
        }
    }

  }


  return (
    <div className="Container">
       <source src="/sounds/theme.mp3" type="mp3"/>
      {intro ?<div className="intro"><h1 >ARE THOU READY</h1> <a className="intro-answer" onClick={() => (setIntro(false))}>YES</a></div>:
      <>
      <div className="title">
        <h1>Legend of the Coder</h1>
        <h5 className="subtitle">A Serious Game Project</h5>
      </div>
      <div className="App">
        <div className="Play-grid"> 
          {mapData && !reload?
          <MapGrid mapData={mapData}></MapGrid>
          :<MapGrid mapData={mapData}></MapGrid>
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
            test */
           
            var hero = getHero()
            moveUp(hero);"
            onMount={handleEditorDidMount}
          />
          <div className="buttonBar" onClick={play}>
            <p unselectable="on" className={'playText ' + (playing === 'true' ? 'running' : '')}>PLAY</p>
          </div>
         
        </div>
      </div>
       </>
}
    </div>
  );
}

export default App;
