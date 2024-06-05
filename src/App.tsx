/* eslint-disable  @typescript-eslint/no-unused-vars */
import "./App.css";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useRef } from "react";
import MapGrid from "./MapGrid";
import { useState } from "react";
import { useEffect } from "react";
// @ts-ignore
import themeMp3 from './sounds/theme.mp3';
// @ts-ignore
import stepsMp3 from './sounds/steps.wav';
// @ts-ignore
import hurtMp3 from './sounds/hurt.wav';
// @ts-ignore
import attackMp3 from './sounds/attack.wav';
// @ts-ignore
import enemyDieMp3 from './sounds/enemydie.wav';
// @ts-ignore
import enemyHurtMp3 from './sounds/enemyhurt.wav'
// @ts-ignore
import gameOverMp3 from './sounds/gameover.wav'
// @ts-ignore
import winMp3 from './sounds/win.wav'
// @ts-ignore
import battleMp3 from './sounds/battle.mp3'
// @ts-ignore
import Tutorial from "./tutorial/Tutorial";

function App() {

  type Entity = {
    id :number
    type: string
    row : number
    col : number
    movement: number,
    initiative: number,
    attack:number,
    props:any
  }
  const playerName: string = "a";
  const editorRef:any = useRef(null);
  const playConsole:any = useRef(null);
  const [mapData,setMapData] = useState(require("./maps/1.json"));

  const [reload, setReload] = useState(false);
  const [playing, setPlaying] = useState('false');
  const [intro, setIntro] = useState(true);
  const [statsOutput, setStatsOutput] = useState("");
  const [myXp, setMyXp] = useState(0);
  const [enemiesInRange, setEnemiesInRage]= useState<Entity[]>([]);
  const [battleOst, setBattleOst] = useState(new Audio(battleMp3));
  const [exploreOst, setExploreOst] = useState(new Audio(themeMp3));


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
    var storedXp =  localStorage.getItem('xp');
    if(storedXp) setMyXp(Number(storedXp));
    updateStatDisplay();
  }, [mapData])
  

  useEffect(() => {
    if(myXp > 0){
      localStorage.setItem('xp', myXp+"");
      updateStatDisplay();
    }
  },[myXp])

  useEffect(() => {
    if(reload){
      setReload( r => !r);
      updateStatDisplay();
      var hero = getHero();
      if(!hero ||hero.props.hp < 1){
        //gameover
        setPlaying('false');
        navigator.clipboard.writeText(editorRef!.current!.getValue())
        playGameOverSound();
        alert("GAME OVER. Sending thy hero back to the menu. Copied the used code to clipboard");
        window.location.reload();
      }
    }
  }, [reload])
  
  /*SOUNDS */
  useEffect(() => {
    if(!intro){
      if(enemiesInRange.length < 1 || getMonsters().length < 1){
        battleOst.pause();
        exploreOst.volume = 0.3;
        exploreOst.loop = true;
        exploreOst.play();
      }else if(battleOst.paused === true){
        exploreOst.pause();
        battleOst.volume= 0.4;
        battleOst.play();
        battleOst.loop = true;
      }
      setExploreOst(exploreOst);
      setBattleOst(battleOst);

    }
  }, [intro, enemiesInRange, mapData])

  const calculateLevel  = (xp: number): number => {
    if(xp === 0){
      return 0;
    }
    return Math.trunc(xp / 200);
  }

  const updateStatDisplay = () =>{
    var entities = getMonsters();
    var hero = getHero();
    if(hero) entities.push(hero);
    var output = "\\\\\\STATS///<br/>MY LEVEL:" + calculateLevel(myXp) + "     MY XP:" + myXp +"<br/><br/>";
    entities.reverse().forEach(x =>{ 
      if(x.props.hp < 1){ //kill
        removeFromRange(x);
        clearTile(x.col, x.row)
        if(x.props.xp){
          var xpGain = myXp as number + x.props.xp as number;
          setMyXp(xpGain);
        }
        return;
      }
      output += x.type + "-"+ x.id+ "&emsp;&emsp;&emsp;&emsp;hp: " + x.props.hp +"&emsp;&emsp;&emsp;&emsp;ATP:"+x.attack+"<br/>"});
    setStatsOutput(output);
  }

const playMovementSound = () =>{
  var mvmt = new Audio(stepsMp3);
  mvmt.volume = 0.5;
  mvmt.play();
}

const playAttackSound = () =>{
  var audio = new Audio(attackMp3);
  audio.volume = 0.7;
  audio.play();
}

const playHeroHurtSound = () =>{
  var audio = new Audio(hurtMp3);
  audio.volume = 0.7;
  audio.play();
}

const playEnemyHurtSound = () =>{
  var audio = new Audio(enemyHurtMp3);
  audio.volume = 0.7;
  audio.play();
}

const playEnemyDieSound = () => {
  var audio = new Audio(enemyDieMp3);
  audio.volume = 0.7;
  audio.play();
}


const playWinSound = () => {
  var audio = new Audio(winMp3);
  audio.volume = 0.8;
  audio.play();
}

const playGameOverSound = () => {
  var audio = new Audio(gameOverMp3);
  audio.volume = 0.9;
  audio.play();
}


  const setupLogger = () => {
    console.log(playConsole)
    var old = console.log;
    console.log = function (message) {
      if(playConsole){
        (playConsole.current as HTMLParagraphElement).scrollTop = (playConsole.current as HTMLParagraphElement).scrollHeight;
        if (typeof message == 'object') {
          (playConsole.current as HTMLParagraphElement).innerHTML= (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />' + (playConsole.current as HTMLParagraphElement).innerHTML;
      } else {
        (playConsole.current as HTMLParagraphElement).innerHTML = message + '<br />' + (playConsole.current as HTMLParagraphElement).innerHTML;
      }
      }else{
        old(message);
      }

    }
    console.log("Events will be output here")
  };

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

  const getEntities = (type: string): Entity[] => {
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
            attack: value.attack ? value.attack : 1,
            props : cellValue
          }
          entities.push(entity)
        }
      }
    }
    return entities;
  };

  const findEntityById = (id:number) : Entity | undefined => {
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
            attack: value.attack ? value.attack : 1,
            props : cellValue
          }
          return entity;
        }
      }
    }
  }

  const getEntityOnTile= (x: number, y:number): Entity | undefined => {
    var data = mapData.tiles.rows[y+""][""+x];
    if(!data) return undefined;
    var entity: Entity = {
      id: data.id,
      col : +x,
      row : +y,
      type: data.type,
      movement: data.movement ? data.movement : 0,
      initiative: data.initiative ? data.initiative : 1,
      attack: data.attack ? data.attack : 1,
      props : data
    }
    return entity;
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
      playWinSound();
      setMyXp(myXp as number + 300);
      setPlaying('false');
      alert("YOU WIN, received XP for completing level. Sending thy hero back to the menu. Copied the used code to clipboard");
      window.location.reload();
    }
    return ["monster","rock","water","hero"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) >= 0
  } 

  const validHeroSpot = (x: number,y:number) => {
    return (isInbounds(x,y) && ["monster","rock","water","hero"].indexOf(mapData.tiles.rows[y+""][""+x]?.type) <1 );
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
    entity.row= oldY- 1;
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
    entity.col = oldX - 1;
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
    entity.col = oldX + 1;
    if(!isInbounds(entity.col,entity.row) ||isBlocked(entity.col,entity.row) ){
      console.log(entity.type + " can't go right");
      entity.col = oldX;
      entity.row = oldY;
      return false;
    }
    updateTile(entity, oldX,oldY);
    return true;
  }


  const attack = (x: number, y: number, attacker: Entity) => {
    var defender = getEntityOnTile(x, y);
    if (defender && (defender.type === 'monster' || defender.type === 'hero')) {
      console.log(attacker.type + " is attacking " + defender.type + " for " + attacker.attack)
      defender.props.hp = (defender?.props.hp - attacker?.attack);
      defender.props.dmg = true;
      playAttackSound();
      if (defender.props.hp < 1) {
        //remove defender
        if (defender.type !== 'hero') {
          playEnemyDieSound();
        }
        // clearTile(x,y);
      } else {
        if (defender.type === 'hero') {
          playHeroHurtSound();
        } else {
          playEnemyHurtSound();
        }
      }
    } else {
      console.log(attacker.type + " tried to attack [col " + x + ", row" + y + "] but nothing to attack was there");
    }
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
    navigator.clipboard.writeText(editorRef!.current!.getValue());
    console.log("Play is starting...");
    setPlaying('true');
  }

  const allTurns = async (entities: Entity[]) => {
    if(!playing) return;
    var index = 0;

    const entityTurn = async (entity:Entity) => {
      if(!playing || entity.props.hp < 1) return;
      entity.props.dmg=false;
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
    while (playing==='true' && findQueen()) {
      var entities = getMonsters();
      entities.push(getHero());
      entities = entities.sort((x,y) => x.initiative - y.initiative);
      await allTurns(entities);
      await delay(entities.length * (baseDelay+ (baseDelay/100)));

    }

  }



  const removeFromRange = (monster: Entity) => {
    if(enemiesInRange.find(x => x.id === monster.id)){
      var index = enemiesInRange.indexOf(monster)
      setEnemiesInRage(enemiesInRange.splice(index,1));
    }
  }

  const monsterTurn = (monster: Entity) => {
    //SAMPLE CODE / in further version logic should be interchangeable
    var hero = getHero();
    if(!hero) return;
    var colDiff = hero.col - monster.col;
    var rowDiff = hero.row - monster.row;
    var notBlocked = true;

    if (Math.abs(rowDiff) + Math.abs(colDiff) < 2) {
      if(!enemiesInRange.find(x => x.id === monster.id)){
        setEnemiesInRage([...enemiesInRange, monster]);
      }
      attack(hero.col, hero.row, monster);
    } else {
      removeFromRange(monster);
      if (Math.abs(rowDiff) > Math.abs(colDiff)) { // check which axis is further away, then reduce the one closer
        //reduce row axis
        if (rowDiff < 0) {
          notBlocked = moveUp(monster);
        } else if (rowDiff >= 1) {
          notBlocked = moveDown(monster);
        }
      } else {
        //recude col axis
        if (colDiff < 0) {
          notBlocked = moveLeft(monster);
        } else if (colDiff >= 1) {
          notBlocked = moveRight(monster);
        }
      }
      while (!notBlocked) {
        {
          var movementOptions = [(): boolean => { return moveDown(monster) }, (): boolean => { return moveUp(monster) }, (): boolean => { return moveLeft(monster) }, (): boolean => { return moveRight(monster) }];
          var pick = getRandomArbitrary(0, movementOptions.length - 1);
          notBlocked = movementOptions[Math.trunc(pick)]();
          console.log("Monster is confused, looking for alternative path")
        }
      }
    }
  }

  var hasDoneMovement = false;
  var hasDoneAction = false;


  /*exposed specific hero actions*/

  const moveHeroUp = () => {
    if (!hasDoneMovement) { 
      moveUp(getHero()) 
      hasDoneMovement = true;
    }else{
      console.log("Hero already moved, cant move again");
    }
  }

  const moveHeroDown = () => {
    if (!hasDoneMovement) { 
      moveDown(getHero()) 
      hasDoneMovement = true;
    }else{
      console.log("Hero already moved, cant move again");
    }
  }
  const moveHeroLeft = () => {
    if (!hasDoneMovement) { 
      moveLeft(getHero()) 
      hasDoneMovement = true;
    }else{
      console.log("Hero already moved, cant move again");
    }
  }
  const moveHeroRight = () => {
    if (!hasDoneMovement) { 
      moveRight(getHero()) 
      hasDoneMovement = true;
    }else{
      console.log("Hero already moved, cant move again");
    }
  }
  
  const attackUp = () => { if(hasDoneAction){console.log("Hero can't attack, hes out of actions");return;}var hero = getHero(); attack(hero.col, hero.row-1, hero);hasDoneAction=true; }
  const attackDown = () => {  if(hasDoneAction){console.log("Hero can't attack, hes out of actions");return;}var hero = getHero(); attack(hero.col, hero.row+1, hero);hasDoneAction=true; }
  const attackLeft = () => {  if(hasDoneAction){console.log("Hero can't attack, hes out of actions");return;}var hero = getHero(); attack(hero.col-1, hero.row, hero); hasDoneAction=true;}
  const attackRight = () => {  if(hasDoneAction){console.log("Hero can't attack, hes out of actions");return;}var hero = getHero(); attack(hero.col+1, hero.row, hero); hasDoneAction=true;}

  //LVL 2
  const spinAttack = () => {
    if(calculateLevel(myXp) >= 2){
      if(hasDoneAction){
        console.log("Hero can't spin attack, hes out of actions");
        return;
      }
      attackUp();
      hasDoneAction = false;
      attackDown();
      hasDoneAction = false;
      attackLeft();
      hasDoneAction = false;
      attackRight();
      console.log("The hero spin attacked");
      return
    }
      console.log("COULDNT SPINATTACK, ABILITY HASN'T BEEN UNLOCKED YET");
  }

    //LVL 3
    const selfHeal = () => {
      if(calculateLevel(myXp) >= 3){
        if(hasDoneAction){
          console.log("Hero can't heal, hes out of actions");
          return;
        }
        getHero().props.hp += 1;
        console.log("The hero healed for 1");
        hasDoneAction = true;
        return
      }
        console.log("COULDNT HEAL, ABILITY HASN'T BEEN UNLOCKED YET");
    }


    const Memory: any[] = [];


    const heroTurn = () => {
      hasDoneMovement = false;
      hasDoneAction = false;
      var heroCode = editorRef!.current!.getValue();
      var re = /mapData/gi;
      eval(heroCode.replace(re, 'no cheeto my mateo').split("END INTRO")[1]);
    }

  return (
    <div className="Container">
      {intro ?<div className="intro"><h1 >Choose thy fate alone. Seize it with thine own hands.</h1> 
      <a className="intro-answer" onClick={() => {setMapData(require("./maps/1.json"));(setIntro(false))}}>LEVEL 1</a>
      <a className="intro-answer" onClick={() => {setMapData(require("./maps/2.json"));(setIntro(false))}}>LEVEL 2</a>
      <a className="intro-answer" onClick={() => {setMapData(require("./maps/3.json"));(setIntro(false))}}>LEVEL 3</a>
      <a className="intro-answer" onClick={() => {setMapData(require("./maps/4.json"));(setIntro(false))}}>LEVEL 4</a>
      <a className="intro-answer" onClick={() => {setMapData(require("./maps/5.json"));(setIntro(false))}}>LEVEL 5</a>
      </div>:
      <>
      <div className="title">
        <h1>Legend of the Coder</h1>
        <h5 className="subtitle">{mapData.name}</h5>
      </div>
      <div className="App">
        <div className="Play-grid"> 
          {mapData && !reload?
          <MapGrid mapData={mapData} editorClick={()=> {}}></MapGrid>
          :<MapGrid mapData={mapData} editorClick={()=> {}}></MapGrid>
          } 
          <div className="outputs">
              <p className="console" ref={playConsole}></p>
              <p className="stats" dangerouslySetInnerHTML={{__html: statsOutput}}></p>
          </div>
          
        </div>
        <div className="Dev-area">
          <Editor
            className="mainEditor"
            height="80vh"
            theme="vs-dark"
            defaultLanguage="typescript"
            defaultValue={Tutorial}
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
