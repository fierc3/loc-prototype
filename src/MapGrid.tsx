

const MapGrid = (props: any) =>{

    const getRows = () => {
        console.log(props)
        console.log(props)
        var rows:any = []
        for (var rowIndex = 0; rowIndex < props.mapData.defaults.ysize; rowIndex++) {
            var row:any = [];

            for(var colIndex = 0; colIndex < props.mapData.defaults.xsize; colIndex++ ){
                var current = props.mapData.tiles.rows[rowIndex+""][colIndex];
                console.log(current);
                row.push(<div className={"cell " + current?.type } key={colIndex+rowIndex}></div>)
               console.log(colIndex)
            }
            console.log("row")
            rows.push(<div className="row" key={rowIndex+row}>{row}</div>);
        }
        return rows
    }


    return (
        <div className="mapContainer">
            {getRows()}
        </div >
      );
}

export default MapGrid