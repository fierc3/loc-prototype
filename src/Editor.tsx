import { useEffect, useRef, useState } from "react";
import MapGrid from "./MapGrid";


const Editor = (props: any) =>{

    const [reload, setReload] = useState(false);
    const [mapData,setMapData] = useState(require("./maps/2.json")); //use lvl 2 as template
    const playConsole:any = useRef(null);
    const [selectedType, setSelectedType] = useState<string|null>(null);

    const generate = () => {
          if(playConsole){
            (playConsole.current as HTMLParagraphElement).innerHTML= (JSON && JSON.stringify ? JSON.stringify(mapData) : mapData) + '<br />';
          }
      };

    useEffect(() => {
        if(reload){
          setReload( r => !r);
        }
      }, [reload])

      useEffect(() => {
        //setupLogger();
      }, [playConsole]);

      const samples = {
        queen: { id: 1, type: "queen" },
        rock: { id: 2, type: "rock" },
        monster: {
          id: 11,
          type: "monster",
          movement: 1,
          hp: 2,
          initiative: 3,
          xp: 100,
        },
        water: { id: 3, type: "water" },
        hero: { id: 666, type: "hero", movement: 1, hp: 10, initiative: 2 },
      };



      const click = (e) => {
          var coordinates = e.target.classList[0];
          const col = coordinates.split("-")[0];
          const row = coordinates.split("-")[1];
          
        if(!selectedType){
            mapData.tiles.rows[row+""][col+""] = undefined;
            setMapData(mapData);
            setReload(true);
            return;
        }
        mapData.tiles.rows[row+""][col+""] = samples[selectedType];
        setMapData(mapData);
        setReload(true);
      }

    return (
        <>
        <div className="title">
            EDITOR
        </div >
        <div className="App">
        <div className="Play-grid"> 
          {mapData && !reload?
          <MapGrid mapData={mapData} editorClick={(e) => click(e)}></MapGrid>
          :<MapGrid mapData={mapData} editorClick={(e) => click(e)}></MapGrid>
          } 
          <div className="outputs">
            <p className="console" ref={playConsole}></p>
          </div>
          
        </div>
        <div className="Dev-area">
            <p className="console">{selectedType}</p>
            <div className="cell hero" onClick={() => setSelectedType("hero")}></div>
            <div className="cell water"  onClick={() => setSelectedType("water")}></div>
            <div className="cell rock"  onClick={() => setSelectedType("rock")}></div>
            <div className="cell queen"  onClick={() => setSelectedType("queen")}></div>
            <div className="cell monster"  onClick={() => setSelectedType("monster")}></div>
            <div className="cell bg-tile"  onClick={() => setSelectedType(null)}></div>
          <div className="buttonBar" onClick={generate}>
            <p unselectable="on" className={'playText'}>GENERATE</p>
          </div>
         
        </div>
      </div>
        </>
      );
}

export default Editor