const MapGrid = ({mapData, editorClick}) => {
  const getRows = () => {
    var rows: any = [];
    for (
      var rowIndex = 0;
      rowIndex <mapData.defaults.ysize;
      rowIndex++
    ) {
      var row: any = [];

      for (
        var colIndex = 0;
        colIndex < mapData.defaults.xsize;
        colIndex++
      ) {
        var current =mapData.tiles.rows[rowIndex + ""][colIndex];
        row.push(
          <div
            className={
              colIndex+"-"+rowIndex + " cell " +
              (current ? current.type : "bg-tile") +
              (current?.dmg ? " dmg" : "")
            }
            key={colIndex +";"+ rowIndex}
            onClick={(e) => editorClick(e)}
          ></div>
        );
      }
      rows.push(
        <div className="row" key={rowIndex + row}>
          {row}
        </div>
      );
    }
    return rows;
  };

  return <div className="mapContainer">{getRows()}</div>;
};

export default MapGrid;
