import React, { Component } from 'react';
import './App.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/rust/rust.js';
import ReactNbsp from 'react-nbsp';


class App extends Component {

  constructor(props) {
    super(props);
    /*this.state = {code : 'use std::thread;fn main() {let mut threads = Vec::new();for i in 0..10 {threads.push(thread::spawn(move || {println!("Output from thread {}", i);}));}for thread in threads {let _ = thread.join();}}',
    output : [], command : ""};*/

    this.state = {
      code : 'fn main(){\n\tprintln!("{}", 123);\n}',
      output : [] , 
      command : ""
    }
  } 


  render() {
    return (
      <div className="grid-container">
        <div className="header">
            <h1>Rust Compiler</h1>
        </div>
        <div className="left">
          <center><button onClick = { () => this.compile()}>Compile and run</button></center> <br/><br/>
          <CodeMirror autoFocus={true} name="code" options = {{mode : 'rust', lineNumbers: true}} onChange = {(s) => this.setState({code : s})} value = {this.state.code}>

            </CodeMirror>
        </div>
        <div className="right">
        <center><h2 onClick = {() => this.setState({output : []})}>Execution</h2></center><br/>
          <div className="output">
            {
              this.state.output.map(item => (
                <p key={Math.random()}>
                  {
                    this.createLine(item)
                  }
                </p>
              ))
            }
          </div>
          <div className="terminal_input">
            <span> <ReactNbsp/>></span><input name="command" onKeyPress={b => {if(b.key ==='Enter') this.sendCmd()}} onChange={this.onChange} value={this.state.command}></input>
          </div>
        </div>
      </div>
    );
  }

  onChange = event => {
    this.setState({
      [event.target.name] : event.target.value
    })
  }

  sendCmd(){
    this.setState({command : ""});
    if(this.state.command.toLowerCase() === "clear") return this.setState({output : []});
    this.setState(() => {
      let output = this.state.output.concat('~$'+this.state.command);
      return {code : this.state.code, output};
      });

    fetch("http://0.0.0.0:5000/command", {
      method: "POST",
      headers : {'Content-Type': 'application/json'},
      body : JSON.stringify({command : this.state.command})})
      .then(e => e.json())
      .then(r => {
        this.setState(state => {
          let output = this.state.output.concat(r.output);
          return {code : this.state.code, output};
      })})
      .catch(error => console.error('Error', error));
  }

  createLine(temp){

    let arr = [];

    let t = temp.split('\n'); 

    for(let a = 0; a < t.length; a++){
      
      if(t[a] === "") continue
    
      arr.push(
        <span key={Math.random()}>
          {this.getSpacedShit(t[a])} <br/>
        </span>
      );
    }
    return arr;
  }

  getSpacedShit(string){

    let arr = string.split('');

    if(arr[0] != ' ' && string.indexOf("|") > 0) arr[0] = <React.Fragment><ReactNbsp key={Math.random()}/><ReactNbsp key={Math.random()}/></React.Fragment>;

    for(let x = 0; x < arr.length; x++){
      if(arr[x] === " ") arr[x] = <ReactNbsp key={Math.random()}/>
    }
    return arr;
  }

  compile(){
    this.setState(state => {
      let output = this.state.output.concat(`~$rustc main.rs`);
      return {code : this.state.code, output};
      })

    fetch("http://0.0.0.0:5000/compile", {
      method: "POST",
      headers : {'Content-Type': 'application/json'},
      body : JSON.stringify({code : this.state.code})})
      .then(e => e.json())
      .then(r => {
        this.setState(state => {
          let output = this.state.output.concat(r.output);
          return {code : this.state.code, output};
      })})
      .catch(error => this.setState(state => {
        let output = this.state.output.concat(`Network Error`);
        return {code : this.state.code, output};
        }))
    }
}

export default App;