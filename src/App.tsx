import './App.css';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useRef } from 'react';
import MapGrid from './MapGrid';

function App() {
const playerName: string = "a";
const editorRef = useRef(null);
const mapData = require('./maps/test.json');


const testFunction = () => {

}

const handleEditorDidMount = (editor:any, monaco:any)  => {
  console.log(mapData);
  monaco.editor.defineTheme('myTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: 'FFFFFF' }],
    colors: {
        'editor.foreground': '#FFFFFF',
        'editor.background': '#000000',
        'editorCursor.foreground': '#FFFFFF',
        'editor.lineHighlightBackground': '#000000',
        'editorLineNumber.foreground': '#FFFFFF',
        'editor.selectionBackground': '#000000',
        'editor.inactiveSelectionBackground': '#000000'
    }
});
  console.log(editor)
  console.log(monaco)
  monaco.editor.setTheme("myTheme")
  editorRef.current = editor; 
}

const showValue = () => {
  alert(editorRef?.current);
}


  return (
    <div className="Container">
      <div className="title">
        <h1>Legend of the Coder</h1>
        <h5 className="subtitle">A Serious Game Project</h5>
      </div>
      <div className="App">
        <div className="Play-grid">
          <MapGrid mapData={mapData}></MapGrid>
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
                  <div className="buttonBar">
                    <p  className="playText">PLAY</p>
                  </div>
        </div>
      </div>
    </div >
  );
}

export default App;
