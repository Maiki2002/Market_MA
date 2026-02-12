import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { appRouteTree } from './routes/AppRoutes';
import './App.css'

function NotFound(){
  return <h2>404</h2>
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/app" replace />} />
        <Route path={appRouteTree.path} element={appRouteTree.element}>
          {appRouteTree.children.map((r, i) =>
            r.index ? (
              <Route key={i} index element={r.element} />
            ) : (
              <Route key={i} path={r.path} element={r.element} />
            )
          )}
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
