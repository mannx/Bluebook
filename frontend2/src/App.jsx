// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <div className="App">
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://reactjs.org" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </div>
//   )
// }

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


// export default App
import React, {Component} from "react";
import './App.css';

import Navigation from "./components/Navigation/Navigation.jsx";

// class App extends Component {

// 	render(){
// 		let d = new Date();

// 		return (
// 			<div className="App">
// 				<Navigation month={d.getMonth()+1} year={d.getFullYear()}  />
// 			</div>
// 		);
// 	}
// }

// export default App;

import {Route,Switch} from "react-router-dom";

import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";

export default function App() {
    return (
        <Switch>
        <Route exact path="/" >
            <HomePage />
        </Route>
        <Route path="/:id">
            <UserPage />
        </Route>
        </Switch>
    )
}
